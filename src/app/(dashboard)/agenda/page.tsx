"use client";

import { useState, useMemo, useEffect } from "react";
import { format, addDays, subDays, startOfWeek, endOfWeek, addMinutes, areIntervalsOverlapping } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, X, Clock, User, Scissors, Calendar as CalendarIcon } from "lucide-react";

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

type Appointment = {
  id: string;
  clientName: string;
  service: string;
  barber: string;
  start: Date;
  end: Date;
  status: "confirmed" | "pending";
};

const initialAppointments: Appointment[] = [
  { id: "1", clientName: "Carlos Silva", service: "Corte Masculino", barber: "João Silva", start: new Date(new Date().setHours(10, 0, 0, 0)), end: new Date(new Date().setHours(10, 45, 0, 0)), status: "confirmed" },
  { id: "2", clientName: "Pedro Almeida", service: "Barba Terapia", barber: "Carlos Pereira", start: new Date(new Date().setHours(11, 0, 0, 0)), end: new Date(new Date().setHours(11, 30, 0, 0)), status: "confirmed" },
  { id: "3", clientName: "Fernando Costa", service: "Corte e Barba", barber: "André Costa", start: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(14, 0, 0, 0)), end: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(15, 15, 0, 0)), status: "pending" },
  { id: "4", clientName: "Ricardo Dias", service: "Hidratação Capilar", barber: "Lucas Souza", start: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(16, 0, 0, 0)), end: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(16, 50, 0, 0)), status: "confirmed" },
];


export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [newAppointmentSlot, setNewAppointmentSlot] = useState<Date | null>(null);

  // Guard against hydration errors
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
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
  
  const handleSaveAppointment = (values: any) => {
    console.log("Saving appointment", values);
    // Here you would typically handle saving the appointment to your backend
    // For now, we just close the modal. In a real app, you'd update the `appointments` state.
    setIsModalOpen(false);
  };
  
  const handleCancelAppointment = () => {
    console.log("Canceling appointment", selectedAppointment?.id);
    setIsModalOpen(false);
  }

  if (!hasMounted) {
    return null; // or a loading skeleton
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
                    
                    return (
                        <div
                            key={app.id}
                            className={`absolute w-full p-2 rounded-lg text-white text-xs cursor-pointer z-10 ${app.status === 'confirmed' ? 'bg-primary' : 'bg-accent'}`}
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
                    <Button variant="destructive" onClick={handleCancelAppointment}>Cancelar</Button>
                    <Button variant="outline">Remarcar</Button>
                    <Button>Confirmar</Button>
                </DialogFooter>
             </div>
          ) : (
            <AppointmentForm
                initialData={{startTime: newAppointmentSlot}}
                onSave={handleSaveAppointment}
                onCancel={() => setIsModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
