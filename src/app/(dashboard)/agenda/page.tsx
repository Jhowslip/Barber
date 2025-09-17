"use client";

import { useState, useMemo, useEffect } from "react";
import { format, addDays, subDays, startOfWeek, endOfWeek, addMinutes, areIntervalsOverlapping, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, X, Clock, User, Scissors, Calendar as CalendarIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { AppointmentForm } from "@/components/appointment-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type Appointment = {
  id: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  service: string;
  barberId: string;
  barber: string;
  start: Date;
  end: Date;
  status: "confirmed" | "pending" | "canceled";
};

type ApiAppointment = {
  ID: number;
  Data: string;
  Hora: string;
  Cliente: string;
  Telefone_Cliente: string;
  ID_Servico: number;
  Servico: string;
  ID_Barbeiro: number;
  Barbeiro: string;
  Status: "Confirmado" | "Pendente" | "Cancelado";
};

type Service = {
  id: string;
  name: string;
  duration: number;
};

async function getServices(): Promise<Service[]> {
    try {
        const response = await fetch('https://n8n.mailizjoias.com.br/webhook/servicos');
        if (!response.ok) {
            console.error("Failed to fetch services", response.statusText);
            return [];
        }
        const data = await response.json();
        return data.map((item: any) => ({
            id: String(item.ID),
            name: item.Nome,
            duration: item["Duração (min)"],
        }));
    } catch (error) {
        console.error("Error fetching services:", error);
        return [];
    }
}

async function getAppointments(services: Service[]): Promise<Appointment[]> {
    try {
        const response = await fetch('https://n8n.mailizjoias.com.br/webhook/agenda');
        if (!response.ok) {
            console.error("Failed to fetch appointments", response.statusText);
            return [];
        }
        const data: ApiAppointment[] = await response.json();

        return data.map(item => {
            const startDate = parse(`${item.Data} ${item.Hora}`, 'yyyy-MM-dd HH:mm', new Date());
            const service = services.find(s => s.id === String(item.ID_Servico));
            const duration = service ? service.duration : 30; // Default to 30 mins if service not found
            const endDate = addMinutes(startDate, duration);
            
            let status: "confirmed" | "pending" | "canceled";
            switch (item.Status) {
                case "Confirmado":
                    status = "confirmed";
                    break;
                case "Pendente":
                    status = "pending";
                    break;
                case "Cancelado":
                    status = "canceled";
                    break;
                default:
                    status = "pending";
            }

            return {
                id: String(item.ID),
                clientName: item.Cliente,
                clientPhone: item.Telefone_Cliente,
                serviceId: String(item.ID_Servico),
                service: item.Servico,
                barberId: String(item.ID_Barbeiro),
                barber: item.Barbeiro,
                start: startDate,
                end: endDate,
                status: status,
            };
        }).filter(app => app.status !== 'canceled'); // Filter out canceled appointments from display
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return [];
    }
}


export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [newAppointmentSlot, setNewAppointmentSlot] = useState<Date | null>(null);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
  const { toast } = useToast();

  const loadAgendaData = async () => {
    setIsLoading(true);
    const fetchedServices = await getServices();
    setServices(fetchedServices);
    const fetchedAppointments = await getAppointments(fetchedServices);
    setAppointments(fetchedAppointments);
    setIsLoading(false);
  }

  useEffect(() => {
    loadAgendaData();
  }, []);

  const week = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  }, [currentDate]);

  const timeSlots = useMemo(() => {
    const start = new Date(currentDate);
    start.setHours(9, 0, 0, 0);
    const end = new Date(currentDate);
    end.setHours(19, 0, 0, 0);
    const slots = [];
    let current = start;
    while (current < end) {
      slots.push(current);
      current = addMinutes(current, 30);
    }
    return slots;
  }, [currentDate]);

  const handlePrevWeek = () => setCurrentDate(subDays(currentDate, 7));
  const handleNextWeek = () => setCurrentDate(addDays(currentDate, 7));

  const handleSlotClick = (day: Date, time: Date) => {
    const slotDateTime = new Date(day);
    slotDateTime.setHours(time.getHours(), time.getMinutes(), 0, 0);
    setNewAppointmentSlot(slotDateTime);
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setNewAppointmentSlot(null);
    setIsModalOpen(true);
  };
  
  const handleSaveAppointment = async (values: any) => {
    setIsSubmitting(true);
    try {
        const service = services.find(s => s.id === values.serviceId);
        if (!service) throw new Error("Serviço não encontrado");

        const newAppointment = {
            ID: appointments.length > 0 ? Math.max(...appointments.map(a => parseInt(a.id))) + 2 : 1,
            Data: format(values.startTime, 'yyyy-MM-dd'),
            Hora: format(values.startTime, 'HH:mm'),
            Cliente: values.clientName,
            Telefone_Cliente: values.clientPhone,
            ID_Servico: parseInt(values.serviceId),
            Servico: service.name,
            ID_Barbeiro: parseInt(values.barberId),
            Barbeiro: values.barberName,
            Status: "Pendente"
        };
        
        const response = await fetch('https://n8n.mailizjoias.com.br/webhook/agenda', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAppointment),
        });

        if (!response.ok) {
            throw new Error('Falha ao criar o agendamento.');
        }

        toast({
            title: "Sucesso!",
            description: "Agendamento criado com sucesso.",
        });

        setIsModalOpen(false);
        await loadAgendaData();

    } catch (error) {
        console.error("Error saving appointment:", error);
        toast({
            title: "Erro",
            description: "Não foi possível criar o agendamento.",
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleStatusChange = async (appointment: Appointment, newStatus: "Confirmado" | "Cancelado") => {
    setIsSubmitting(true);
    try {
        const payload = {
            ID: parseInt(appointment.id),
            Data: format(appointment.start, 'yyyy-MM-dd'),
            Hora: format(appointment.start, 'HH:mm'),
            Cliente: appointment.clientName,
            Telefone_Cliente: appointment.clientPhone,
            ID_Servico: parseInt(appointment.serviceId),
            Servico: appointment.service,
            ID_Barbeiro: parseInt(appointment.barberId),
            Barbeiro: appointment.barber,
            Status: newStatus,
        };

        const response = await fetch('https://n8n.mailizjoias.com.br/webhook/agenda', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Falha ao ${newStatus === 'Confirmado' ? 'confirmar' : 'cancelar'} o agendamento.`);
        }
        
        toast({
            title: "Sucesso!",
            description: `Agendamento ${newStatus === 'Confirmado' ? 'confirmado' : 'cancelado'} com sucesso.`,
        });

        setIsModalOpen(false);
        setAppointmentToCancel(null);
        await loadAgendaData();

    } catch (error) {
        console.error(`Error updating status for appointment ${appointment.id}:`, error);
        toast({
            title: "Erro",
            description: `Não foi possível ${newStatus === 'Confirmado' ? 'confirmar' : 'cancelar'} o agendamento.`,
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  }


  if (isLoading) {
    return (
        <div className="flex flex-1 flex-col p-4 md:p-8 pt-6 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <Skeleton className="h-9 w-48" />
                    <Skeleton className="h-5 w-80 mt-2" />
                </div>
                 <div className="flex items-center space-x-2">
                    <Skeleton className="h-10 w-36" />
                    <Skeleton className="h-10 w-36" />
                 </div>
            </div>
             <div className="grid grid-cols-[auto_1fr] border rounded-lg overflow-hidden">
                <div className="bg-card">
                    <div className="h-16 border-b flex items-center justify-center">
                        <Skeleton className="h-6 w-6 rounded-full" />
                    </div>
                    {Array.from({length: 20}).map((_, i) => (
                         <div key={i} className="h-20 border-b flex items-center justify-center">
                             <Skeleton className="h-5 w-12" />
                         </div>
                    ))}
                </div>
                 <div className="grid grid-cols-7">
                    {Array.from({length: 7}).map((_, i) => (
                        <div key={i} className="flex flex-col border-l">
                            <div className="h-16 border-b flex flex-col items-center justify-center p-2 text-center space-y-1">
                                <Skeleton className="h-5 w-12" />
                                <Skeleton className="h-4 w-10" />
                            </div>
                            <div className="relative flex-1">
                               {Array.from({length: 20}).map((_, j) => (
                                  <div key={j} className="h-20 border-b"/>
                               ))}
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-4 md:p-8 pt-6 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agenda</h2>
          <p className="text-muted-foreground">
            Visualize e gerencie os agendamentos da semana.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handlePrevWeek}>
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden md:inline ml-2">Semana Anterior</span>
          </Button>
          <Button variant="outline" onClick={handleNextWeek}>
            <span className="hidden md:inline mr-2">Próxima Semana</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[auto_1fr] border rounded-lg overflow-hidden">
        {/* Time Column */}
        <div className="bg-card">
          <div className="h-16 border-b flex items-center justify-center font-semibold text-card-foreground">
            <Clock className="h-5 w-5" />
          </div>
          {timeSlots.map((time) => (
            <div key={time.toString()} className="h-20 border-b flex items-center justify-center text-sm text-muted-foreground">
              {format(time, "HH:mm")}
            </div>
          ))}
        </div>

        {/* Days Columns */}
        <div className="grid grid-cols-7">
          {week.map((day) => (
            <div key={day.toString()} className="flex flex-col border-l">
              <div className="h-16 border-b flex flex-col items-center justify-center p-2 text-center">
                <p className="font-semibold capitalize text-sm md:text-base">
                  {format(day, "eee", { locale: ptBR })}
                </p>
                <p className="text-muted-foreground text-sm">
                  {format(day, "dd/MM")}
                </p>
              </div>
              <div className="relative flex-1">
                {timeSlots.map((time) => (
                  <div
                    key={time.toString()}
                    className="h-20 border-b cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSlotClick(day, time)}
                  />
                ))}
                {appointments
                  .filter(app => format(app.start, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
                  .map(app => {
                    const top = ((app.start.getHours() - 9) * 60 + app.start.getMinutes()) / 30 * 5; // 5rem = h-20
                    const duration = (app.end.getTime() - app.start.getTime()) / (1000 * 60);
                    const height = (duration / 30) * 5; // 5rem = h-20
                    
                    const statusClass = {
                        confirmed: 'bg-primary/90 hover:bg-primary',
                        pending: 'bg-amber-500 hover:bg-amber-600',
                        canceled: 'bg-destructive'
                    };
                    
                    return (
                        <div
                            key={app.id}
                            className={`absolute w-full p-2 rounded-lg text-white text-xs cursor-pointer z-10 transition-colors ${statusClass[app.status]}`}
                            style={{ top: `${top}rem`, height: `${height}rem`, left: '0.1rem', right: '0.1rem', width: 'calc(100% - 0.2rem)' }}
                            onClick={() => handleAppointmentClick(app)}
                        >
                            <p className="font-bold truncate">{app.clientName}</p>
                            <p className="truncate">{app.service}</p>
                            <p className="truncate text-white/80">{app.barber}</p>
                        </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedAppointment ? "Detalhes do Agendamento" : "Novo Agendamento"}
            </DialogTitle>
          </DialogHeader>
          {selectedAppointment ? (
             <div className="space-y-4 py-4">
                <div className="flex items-center gap-4">
                    <User className="h-5 w-5 text-muted-foreground"/>
                    <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Cliente</span>
                        <span className="font-semibold">{selectedAppointment.clientName}</span>
                    </div>
                </div>
                 <div className="flex items-center gap-4">
                    <Scissors className="h-5 w-5 text-muted-foreground"/>
                    <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Serviço</span>
                        <span className="font-semibold">{selectedAppointment.service}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <CalendarIcon className="h-5 w-5 text-muted-foreground"/>
                     <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Horário</span>
                        <span className="font-semibold">{`${format(selectedAppointment.start, 'dd/MM/yyyy HH:mm')} - ${format(selectedAppointment.end, 'HH:mm')}`}</span>
                    </div>
                </div>
                <DialogFooter className="pt-4">
                    <Button variant="destructive" onClick={() => { setAppointmentToCancel(selectedAppointment); setIsModalOpen(false); }} disabled={isSubmitting}>
                         {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Cancelar
                    </Button>
                    <Button variant="outline" disabled={true}>Remarcar</Button>
                    {selectedAppointment.status === 'pending' && (
                        <Button onClick={() => handleStatusChange(selectedAppointment, "Confirmado")} disabled={isSubmitting}>
                           {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                           Confirmar
                        </Button>
                    )}
                </DialogFooter>
             </div>
          ) : (
            <AppointmentForm
                initialData={{startTime: newAppointmentSlot}}
                onSave={handleSaveAppointment}
                onCancel={() => setIsModalOpen(false)}
                isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!appointmentToCancel} onOpenChange={(open) => !open && setAppointmentToCancel(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
                Esta ação cancelará o agendamento de "{appointmentToCancel?.clientName}". Esta ação não pode ser desfeita.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setAppointmentToCancel(null)}>Voltar</AlertDialogCancel>
                <AlertDialogAction onClick={() => appointmentToCancel && handleStatusChange(appointmentToCancel, "Cancelado")} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Confirmar Cancelamento
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </div>
  );
}
