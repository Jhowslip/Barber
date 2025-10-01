"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { useEffect, useState, forwardRef } from "react";
import { Loader2 } from "lucide-react";
import InputMask from "react-input-mask";

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
import { getServices, getBarbers, getSettings } from "@/lib/api";
import { Service, Barber } from "@/lib/types";
import { cn } from "@/lib/utils";

const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;

const formSchema = z.object({
  clientName: z.string().min(1, "Nome do cliente é obrigatório."),
  clientPhone: z.string().regex(phoneRegex, "Formato de telefone inválido. Use (99) 99999-9999."),
  serviceId: z.string().min(1, "Selecione um serviço."),
  barberId: z.string().min(1, "Selecione um barbeiro."),
  paymentMethod: z.string().optional(),
  startTime: z.date(),
  // For passing to the parent handler
  barberName: z.string().optional(),
});


type AppointmentFormProps = {
  initialData: Partial<z.infer<typeof formSchema>>;
  onSave: (values: z.infer<typeof formSchema>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
};

const MaskedInput = forwardRef<HTMLInputElement, any>((props, ref) => {
    return <InputMask {...props} mask="(99) 99999-9999"><input ref={ref} {...props} /></InputMask>
});
MaskedInput.displayName = 'MaskedInput';


export function AppointmentForm({ initialData, onSave, onCancel, isSubmitting }: AppointmentFormProps) {
  const [services, setServices] = useState<Pick<Service, 'id' | 'name' | 'status'>[]>([]);
  const [barbers, setBarbers] = useState<Pick<Barber, 'id' | 'name' | 'status'>[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
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
            const [servicesData, barbersData, settingsData] = await Promise.all([
                getServices(),
                getBarbers(),
                getSettings()
            ]);

            setServices(servicesData.filter((s) => s.status === 'active'));
            setBarbers(barbersData.filter((b) => b.status === 'active'));
            
            if(settingsData && settingsData.Formas_Pagamento) {
                setPaymentMethods(settingsData.Formas_Pagamento.split(',').map(p => p.trim()));
            }

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
                <MaskedInput
                    {...field}
                    className={cn(
                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    )}
                    placeholder="(99) 99999-9999"
                />
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
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Forma de Pagamento</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a forma de pagamento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
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
