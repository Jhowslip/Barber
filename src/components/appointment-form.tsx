"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from "./ui/dialog";
import { Skeleton } from "./ui/skeleton";

const formSchema = z.object({
  clientName: z.string().min(1, "Nome do cliente é obrigatório."),
  clientPhone: z.string().min(1, "Telefone do cliente é obrigatório."),
  serviceId: z.string().min(1, "Selecione um serviço."),
  barberId: z.string().min(1, "Selecione um barbeiro."),
  startTime: z.date(),
  // For passing to the parent handler
  barberName: z.string().optional(),
});

type Service = {
  id: string;
  name: string;
};

type Barber = {
  id: string;
  name: string;
};


type AppointmentFormProps = {
  initialData: Partial<z.infer<typeof formSchema>>;
  onSave: (values: z.infer<typeof formSchema>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
};

export function AppointmentForm({ initialData, onSave, onCancel, isSubmitting }: AppointmentFormProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      clientPhone: "",
      ...initialData,
    },
  });

  useEffect(() => {
    async function fetchData() {
        setIsLoading(true);
        try {
            const [servicesRes, barbersRes] = await Promise.all([
                fetch('https://n8n.mailizjoias.com.br/webhook/servicos'),
                fetch('https://n8n.mailizjoias.com.br/webhook/barbers')
            ]);
            const servicesData = await servicesRes.json();
            const barbersData = await barbersRes.json();

            setServices(servicesData.map((s: any) => ({ id: String(s.ID), name: s.Nome })).filter((s:any) => s.Status !== 'Desativado'));
            setBarbers(barbersData.map((b: any) => ({ id: String(b.ID), name: b.Nome })).filter((b:any) => b.Status !== 'Inativo'));

        } catch (error) {
            console.error("Failed to fetch data for form", error);
        } finally {
            setIsLoading(false);
        }
    }
    fetchData();
  }, []);

  function onSubmit(data: z.infer<typeof formSchema>) {
    const selectedBarber = barbers.find(b => b.id === data.barberId);
    onSave({ ...data, barberName: selectedBarber?.name });
  }

  if (isLoading) {
    return (
        <div className="space-y-4 pt-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <DialogFooter className="pt-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-36" />
            </DialogFooter>
        </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="clientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Cliente</FormLabel>
              <FormControl>
                <Input placeholder="Nome completo do cliente" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="clientPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone do Cliente</FormLabel>
              <FormControl>
                <Input placeholder="(99) 99999-9999" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="serviceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serviço</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o serviço desejado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="barberId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Barbeiro</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o barbeiro" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {barbers.map((barber) => (
                    <SelectItem key={barber.id} value={barber.id}>
                      {barber.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="startTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário</FormLabel>
              <FormControl>
                <Input disabled value={field.value ? format(field.value, "dd/MM/yyyy 'às' HH:mm") : ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Salvando..." : "Salvar Agendamento"}
            </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
