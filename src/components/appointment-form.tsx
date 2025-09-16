"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";

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

const formSchema = z.object({
  clientName: z.string().min(1, "Nome do cliente é obrigatório."),
  service: z.string().min(1, "Selecione um serviço."),
  barber: z.string().min(1, "Selecione um barbeiro."),
  startTime: z.date(),
});

type AppointmentFormProps = {
  initialData: Partial<z.infer<typeof formSchema>>;
  onSave: (values: z.infer<typeof formSchema>) => void;
  onCancel: () => void;
};

// Mock data, replace with your actual data fetching
const services = [
  { id: "1", name: "Corte Masculino" },
  { id: "2", name: "Barba Terapia" },
  { id: "3", name: "Corte e Barba" },
  { id: "4", name: "Penteado" },
  { id: "5", name: "Hidratação Capilar" },
];

const barbers = [
  { id: "1", name: "João Silva" },
  { id: "2", name: "Carlos Pereira" },
  { id: "5", name: "André Costa" },
];

export function AppointmentForm({ initialData, onSave, onCancel }: AppointmentFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      ...initialData,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-4 pt-4">
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
          name="service"
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
                    <SelectItem key={service.id} value={service.name}>
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
          name="barber"
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
                    <SelectItem key={barber.id} value={barber.name}>
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
            <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
            </Button>
            <Button type="submit">Salvar Agendamento</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}