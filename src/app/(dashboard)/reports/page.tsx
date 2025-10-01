"use client";

import { useState, useEffect, useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { format, subMonths, startOfMonth, endOfMonth, differenceInDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2, Banknote, Percent, Users } from "lucide-react";
import { DateRange } from "react-day-picker";
import { countBy, orderBy } from "lodash";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Appointment, Barber } from "@/lib/types";
import { getAppointments, getBarbers } from "@/lib/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";


const chartConfig = {
  value: {
    label: "Agendamentos",
    color: "hsl(var(--chart-2))",
  },
  services: {
    label: "Vendas",
    color: "hsl(var(--chart-1))",
  },
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
};

export default function ReportsPage({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  useEffect(() => {
    async function loadData() {
        setIsLoading(true);
        const [appointmentsData, barbersData] = await Promise.all([
          getAppointments(),
          getBarbers()
        ]);
        setAppointments(appointmentsData);
        setBarbers(barbersData);
        setIsLoading(false);
    }
    loadData();
  }, []);

  const filteredAppointments = useMemo(() => {
    if (!date?.from) return [];
    
    // Set to end of day for inclusive range
    const toDate = date.to ? new Date(date.to.setHours(23, 59, 59, 999)) : new Date(date.from.setHours(23, 59, 59, 999));
    
    return appointments.filter(app => {
      const appDate = app.start;
      return appDate >= date.from! && appDate <= toDate && app.status !== 'canceled';
    });
  }, [appointments, date]);

  const previousPeriodAppointments = useMemo(() => {
    if (!date?.from) return [];
    
    const to = date.to || date.from;
    const diff = differenceInDays(to, date.from);

    const prevFrom = subDays(date.from, diff + 1);
    const prevTo = subDays(to, diff + 1);
    
    return appointments.filter(app => {
        const appDate = app.start;
        return appDate >= prevFrom && appDate <= prevTo && app.status !== 'canceled';
    });
  }, [appointments, date]);


  const totalAppointmentsData = useMemo(() => {
    const currentCount = filteredAppointments.length;
    const previousCount = previousPeriodAppointments.length;
    const percentageChange = previousCount > 0 ? ((currentCount - previousCount) / previousCount) * 100 : currentCount > 0 ? 100 : 0;
    return {
        current: currentCount,
        percentageChange: percentageChange,
    };
  }, [filteredAppointments, previousPeriodAppointments]);

  const totalRevenueData = useMemo(() => {
      const currentRevenue = filteredAppointments.reduce((acc, app) => acc + app.price, 0);
      const previousRevenue = previousPeriodAppointments.reduce((acc, app) => acc + app.price, 0);
      const percentageChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : currentRevenue > 0 ? 100 : 0;
      return {
        current: currentRevenue,
        percentageChange: percentageChange,
      };
  }, [filteredAppointments, previousPeriodAppointments])

  const topServicesData = useMemo(() => {
    const serviceCounts = countBy(filteredAppointments, 'service');
    return orderBy(
      Object.entries(serviceCounts).map(([name, value]) => ({ name, value })),
      'value',
      'desc'
    ).slice(0, 5);
  }, [filteredAppointments]);

  const topBarbersData = useMemo(() => {
    const barberCounts = countBy(filteredAppointments, 'barber');
    return orderBy(
      Object.entries(barberCounts).map(([name, value]) => ({ name, value })),
      'value',
      'desc'
    ).slice(0, 4);
  }, [filteredAppointments]);
  
  const busiestHoursData = useMemo(() => {
    const hourCounts = countBy(filteredAppointments, app => format(app.start, 'HH:00'));
    const allHours = Array.from({length: 11}, (_, i) => `${String(i + 9).padStart(2, '0')}:00`);
    const data = allHours.map(hour => ({
        hour,
        value: hourCounts[hour] || 0
    }));
    return data;
  }, [filteredAppointments]);

  const barberCommissionsData = useMemo(() => {
      const commissions: { [key: string]: { name: string; totalCommission: number } } = {};

      filteredAppointments.forEach(app => {
          const barber = barbers.find(b => b.id === app.barberId);
          if (barber && barber.commission > 0) {
              if (!commissions[barber.id]) {
                  commissions[barber.id] = { name: barber.name, totalCommission: 0 };
              }
              const commissionValue = app.price * (barber.commission / 100);
              commissions[barber.id].totalCommission += commissionValue;
          }
      });

      return orderBy(Object.values(commissions), 'totalCommission', 'desc');
  }, [filteredAppointments, barbers]);


  if (isLoading) {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-64" />
                    <Skeleton className="h-5 w-80" />
                </div>
                <div className={cn("grid gap-2", className)}>
                   <Skeleton className="h-10 w-[300px]" />
                </div>
            </div>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de agendamentos</CardTitle>
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-20 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receita Total Estimada</CardTitle>
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-28 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </CardContent>
                </Card>
             </div>
             <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Serviços mais vendidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[300px] w-full" />
                    </CardContent>
                </Card>
                 <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Barbeiros com mais clientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[300px] w-full" />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Comissões por Barbeiro</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <Skeleton className="h-[300px] w-full" />
                    </CardContent>
                </Card>
             </div>
              <Card>
                <CardHeader>
                    <CardTitle>Horários mais disputados</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[250px] w-full" />
                </CardContent>
             </Card>
        </div>
    )
  }


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
          <p className="text-muted-foreground">
            Analise o desempenho da sua barbearia.
          </p>
        </div>
        <div className={cn("grid gap-2", className)}>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "PPP", { locale: ptBR })} -{" "}
                      {format(date.to, "PPP", { locale: ptBR })}
                    </>
                  ) : (
                    format(date.from, "PPP", { locale: ptBR })
                  )
                ) : (
                  <span>Selecione um período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Agendamentos no período
            </CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointmentsData.current}</div>
            <p className={`text-xs ${totalAppointmentsData.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalAppointmentsData.percentageChange.toFixed(1)}% em relação ao período anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Total Estimada
            </CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenueData.current)}</div>
            <p className={`text-xs ${totalRevenueData.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalRevenueData.percentageChange.toFixed(1)}% em relação ao período anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Serviços mais vendidos</CardTitle>
            <CardDescription>Top 5 serviços por volume no período.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart
                data={topServicesData}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <XAxis dataKey="value" type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar
                  dataKey="value"
                  fill="var(--color-services)"
                  radius={4}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Barbeiros com mais clientes</CardTitle>
            <CardDescription>Ranking de barbeiros por atendimentos no período.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart
                data={topBarbersData}
                margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar
                  dataKey="value"
                  fill="var(--color-value)"
                  radius={4}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Comissões por Barbeiro</CardTitle>
                <CardDescription>Total de comissão a pagar no período.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {barberCommissionsData.length > 0 ? barberCommissionsData.map((barber, index) => (
                    <div key={index} className="flex items-center">
                        <Avatar className="h-9 w-9">
                            <AvatarFallback>{barber.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">{barber.name}</p>
                            <p className="text-sm text-muted-foreground">Comissão Total</p>
                        </div>
                        <div className="ml-auto font-medium">{formatCurrency(barber.totalCommission)}</div>
                    </div>
                )) : (
                    <div className="flex flex-col items-center justify-center h-[250px] text-center">
                        <Users className="h-10 w-10 text-muted-foreground mb-4"/>
                        <p className="text-sm text-muted-foreground">Nenhuma comissão registrada no período.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Horários mais disputados</CardTitle>
          <CardDescription>
            Fluxo de agendamentos ao longo do dia no período.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <LineChart
              data={busiestHoursData}
              margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="hour"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                dataKey="value"
                type="natural"
                stroke="var(--color-value)"
                strokeWidth={2}
                dot={true}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
