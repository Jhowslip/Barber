"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  barbershopName: z.string().min(1, { message: "Nome da barbearia é obrigatório." }),
  mainPhone: z.string().min(1, { message: "Telefone principal é obrigatório." }),
  address: z.string().min(1, { message: "Endereço é obrigatório." }),
  operatingHours: z.string().min(1, { message: "Horário de funcionamento é obrigatório." }),
  paymentMethods: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Você deve selecionar pelo menos uma forma de pagamento.",
  }),
  audioResponse: z.boolean().default(false),
  sendReactions: z.boolean().default(false),
});

type ApiConfig = {
  Chave: string;
  Valor: string;
};

const paymentMethods = [
  { id: "pix", label: "Pix" },
  { id: "cartao", label: "Cartão" },
  { id: "dinheiro", label: "Dinheiro" },
];

const mapApiToForm = (apiData: ApiConfig[]): z.infer<typeof formSchema> => {
    const configMap = new Map(apiData.map(item => [item.Chave, item.Valor]));
    
    const paymentMethodsString = configMap.get("Formas_Pagamento") || "";
    const paymentMethodsArray = paymentMethodsString.split(',').map(p => p.trim().toLowerCase()).filter(p => paymentMethods.some(pm => pm.label.toLowerCase() === p));

    // Map labels to ids
    const paymentMethodIds = paymentMethodsArray.map(label => {
        const method = paymentMethods.find(pm => pm.label.toLowerCase() === label);
        return method ? method.id : '';
    }).filter(id => id);


    return {
        barbershopName: configMap.get("Nome_Barbearia") || "",
        mainPhone: configMap.get("Telefone_Principal") || "",
        address: configMap.get("Endereco") || "",
        operatingHours: configMap.get("Horario_Funcionamento") || "",
        paymentMethods: paymentMethodIds,
        audioResponse: (configMap.get("Responder_Audio") || "Não").toLowerCase() === "sim",
        sendReactions: (configMap.get("Enviar_Reacoes") || "Não").toLowerCase() === "sim",
    };
}


export default function SettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      barbershopName: "",
      mainPhone: "",
      address: "",
      operatingHours: "",
      paymentMethods: [],
      audioResponse: false,
      sendReactions: false,
    },
  });

  useEffect(() => {
    async function fetchConfig() {
      try {
        setIsFetching(true);
        const response = await fetch('https://n8n.mailizjoias.com.br/webhook/config');
        if (!response.ok) {
          throw new Error('Falha ao buscar as configurações.');
        }
        const data: ApiConfig[] = await response.json();
        const formattedData = mapApiToForm(data);
        form.reset(formattedData);
      } catch (error) {
        console.error(error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as configurações. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setIsFetching(false);
      }
    }
    fetchConfig();
  }, [form, toast]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    console.log(values);
    // Here you would implement the POST request to save the settings
    setTimeout(() => {
      toast({
        title: "Configurações Salvas",
        description: "Suas alterações foram salvas com sucesso.",
      });
      setIsLoading(false);
    }, 1500);
  }

  if (isFetching) {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="space-y-2">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-5 w-96" />
            </div>
             <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle><Skeleton className="h-7 w-48" /></CardTitle>
                        <CardDescription><Skeleton className="h-5 w-80" /></CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                         <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                         <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle><Skeleton className="h-7 w-48" /></CardTitle>
                        <CardDescription><Skeleton className="h-5 w-80" /></CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-5 w-32" />
                             <div className="flex items-center space-x-3">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-4 w-16" />
                             </div>
                              <div className="flex items-center space-x-3">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-4 w-16" />
                             </div>
                              <div className="flex items-center space-x-3">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-4 w-16" />
                             </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle><Skeleton className="h-7 w-48" /></CardTitle>
                        <CardDescription><Skeleton className="h-5 w-80" /></CardDescription>
                    </CardHeader>
                     <CardContent className="space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </CardContent>
                </Card>
                <Skeleton className="h-10 w-40" />
            </div>
        </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie as informações e configurações da sua barbearia.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Atualize os dados principais da sua barbearia.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="barbershopName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Barbearia</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da sua barbearia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mainPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone principal</FormLabel>
                    <FormControl>
                      <Input placeholder="(99) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Seu endereço completo"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operação</CardTitle>
              <CardDescription>
                Configure o funcionamento e formas de pagamento.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="operatingHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário de funcionamento</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Segunda a Sexta, das 9h às 18h"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentMethods"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Formas de pagamento</FormLabel>
                      <FormDescription>
                        Selecione as formas de pagamento aceitas.
                      </FormDescription>
                    </div>
                    {paymentMethods.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="paymentMethods"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), item.id])
                                      : field.onChange(
                                          (field.value || []).filter(
                                            (value) => value !== item.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Automação</CardTitle>
              <CardDescription>
                Defina as configurações de automação para o atendimento.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="audioResponse"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Responder em Áudio
                      </FormLabel>
                      <FormDescription>
                        Enviar respostas automáticas em formato de áudio.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sendReactions"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Enviar Reações
                      </FormLabel>
                      <FormDescription>
                        Reagir a mensagens com emojis para confirmar o recebimento.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
