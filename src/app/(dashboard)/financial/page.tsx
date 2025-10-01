
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, MoreHorizontal, Calendar as CalendarIcon, WalletCards, TrendingDown, TrendingUp, HandCoins, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { getExpenses, saveExpense, deleteExpense, getAppointments, getBarbers } from "@/lib/api";
import { Expense, Appointment, Barber } from "@/lib/types";
import { format, startOfMonth, endOfMonth, isWithinInterval, eachDayOfInterval, startOfDay, subDays, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ExpenseForm } from "@/components/expense-form";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { ChartContainer, ChartTooltip, ChartTooltipContent, PieChart, Pie, Cell, ChartBarChart, ChartBar, ChartXAxis, ChartYAxis, ChartCartesianGrid, ChartLegend, ChartLegendContent } from "@/components/ui/chart";


const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
};


const chartConfig = {
  receita: {
    label: "Receita",
    color: "hsl(var(--chart-1))",
  },
  despesas: {
    label: "Despesas",
    color: "hsl(var(--chart-2))",
  },
};


export default function FinancialPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

    const { toast } = useToast();
     const [date, setDate] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });


    async function loadFinancialData() {
        setIsLoading(true);
        try {
            const [expensesData, appointmentsData, barbersData] = await Promise.all([
                getExpenses(),
                getAppointments(),
                getBarbers(),
            ]);
            
            const sortedExpenses = expensesData.sort((a, b) => b.date.getTime() - a.date.getTime());
            setExpenses(sortedExpenses);
            setAppointments(appointmentsData);
            setBarbers(barbersData);
        } catch (error) {
             toast({
                title: "Erro ao carregar dados",
                description: "Não foi possível buscar os dados financeiros. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }
    
    useEffect(() => {
        loadFinancialData();
    }, []);

    const { filteredAppointments, filteredExpenses } = useMemo(() => {
        if (!date?.from) {
            return { filteredAppointments: [], filteredExpenses: [] };
        }
        const interval = {
            start: startOfDay(date.from),
            end: date.to ? endOfMonth(date.to) : endOfMonth(date.from),
        };

        const appointmentsInRange = appointments.filter(a => isWithinInterval(a.start, interval));
        const expensesInRange = expenses.filter(e => isWithinInterval(e.date, interval));

        return { filteredAppointments: appointmentsInRange, filteredExpenses: expensesInRange };
    }, [date, appointments, expenses]);
    
    
    const { financialSummary, previousFinancialSummary } = useMemo(() => {
        const calculateSummary = (apps: Appointment[], exps: Expense[]) => {
            const confirmedAppointments = apps.filter(a => a.status === 'confirmed');
            const grossRevenue = confirmedAppointments.reduce((acc, app) => acc + app.price, 0);

            const totalCommissions = confirmedAppointments.reduce((acc, app) => {
                const barber = barbers.find(b => b.id === app.barberId);
                if (barber && barber.commission > 0) {
                    return acc + (app.price * (barber.commission / 100));
                }
                return acc;
            }, 0);
            
            const totalOtherExpenses = exps.reduce((acc, exp) => acc + exp.amount, 0);
            const totalExpenses = totalCommissions + totalOtherExpenses;
            const netProfit = grossRevenue - totalExpenses;

            return { grossRevenue, totalExpenses, netProfit, totalCommissions };
        };

        const currentSummary = calculateSummary(filteredAppointments, filteredExpenses);

        // Previous Period Calculation
        let prevSummary = { grossRevenue: 0, totalExpenses: 0, netProfit: 0, totalCommissions: 0 };
        if (date?.from) {
            const to = date.to || date.from;
            const diff = differenceInDays(to, date.from);
            
            const prevFrom = subDays(date.from, diff + 1);
            const prevTo = subDays(to, diff + 1);

            const prevInterval = { start: prevFrom, end: prevTo };

            const prevAppointments = appointments.filter(a => isWithinInterval(a.start, prevInterval));
            const prevExpenses = expenses.filter(e => isWithinInterval(e.date, prevInterval));
            
            prevSummary = calculateSummary(prevAppointments, prevExpenses);
        }

        return { financialSummary: currentSummary, previousFinancialSummary: prevSummary };

    }, [filteredAppointments, filteredExpenses, barbers, date, appointments, expenses]);
    
    const getPercentageChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        if (current === 0 && previous > 0) return -100;
        return ((current - previous) / previous) * 100;
    };
    
    const revenueChange = getPercentageChange(financialSummary.grossRevenue, previousFinancialSummary.grossRevenue);
    const expensesChange = getPercentageChange(financialSummary.totalExpenses, previousFinancialSummary.totalExpenses);
    const profitChange = getPercentageChange(financialSummary.netProfit, previousFinancialSummary.netProfit);


    const paymentMethodData = useMemo(() => {
        const data = filteredAppointments
            .filter(a => a.status === 'confirmed' && a.paymentMethod)
            .reduce((acc, app) => {
                const method = app.paymentMethod!;
                acc[method] = (acc[method] || 0) + app.price;
                return acc;
            }, {} as { [key: string]: number });

        return Object.entries(data)
            .map(([name, value], index) => ({ name, value, fill: `hsl(var(--chart-${index + 1}))` }))
            .sort((a, b) => b.value - a.value);
    }, [filteredAppointments]);
    
    const paymentMethodChartConfig = useMemo(() => {
        return paymentMethodData.reduce((acc, item) => {
            acc[item.name] = { label: item.name, color: item.fill };
            return acc;
        }, {} as any)
    }, [paymentMethodData])


    const revenueVsExpensesData = useMemo(() => {
        if (!date?.from || !date?.to) return [];

        const intervalDays = eachDayOfInterval({ start: date.from, end: date.to });

        return intervalDays.map(day => {
            const dayStr = format(day, 'yyyy-MM-dd');
            
            const dailyRevenue = filteredAppointments
                .filter(a => a.status === 'confirmed' && format(a.start, 'yyyy-MM-dd') === dayStr)
                .reduce((acc, a) => acc + a.price, 0);
            
            const dailyCommissions = filteredAppointments
                .filter(a => a.status === 'confirmed' && format(a.start, 'yyyy-MM-dd') === dayStr)
                .reduce((acc, app) => {
                    const barber = barbers.find(b => b.id === app.barberId);
                    if (barber && barber.commission > 0) {
                        return acc + (app.price * (barber.commission / 100));
                    }
                    return acc;
                }, 0);
                
            const dailyOtherExpenses = filteredExpenses
                .filter(e => format(e.date, 'yyyy-MM-dd') === dayStr)
                .reduce((acc, e) => acc + e.amount, 0);

            return {
                date: format(day, 'dd/MM'),
                receita: dailyRevenue,
                despesas: dailyCommissions + dailyOtherExpenses
            };
        });

    }, [filteredAppointments, filteredExpenses, barbers, date]);


    const handleSaveExpense = async (values: any) => {
        try {
            const isEditing = !!editingExpense;
            const nextId = expenses.length > 0 ? Math.max(...expenses.map(e => parseInt(e.id))) + 1 : 1;
      
            const body = {
                ...(isEditing ? { ID: Number(editingExpense.id) } : { ID: nextId }),
                Descricao: values.description,
                Valor: values.amount,
                Data: format(values.date, 'yyyy-MM-dd'),
                Categoria: values.category,
            };

            await saveExpense(body);

            toast({
                title: "Sucesso!",
                description: `Lançamento ${isEditing ? 'atualizado' : 'adicionado'} com sucesso.`,
            });

            setIsModalOpen(false);
            setEditingExpense(null);
            await loadFinancialData(); // Reload all data
        } catch (error) {
            console.error("Error saving expense:", error);
            toast({
                title: "Erro",
                description: "Não foi possível salvar o lançamento. Tente novamente.",
                variant: "destructive",
            });
        }
    };
    
    const handleOpenAddModal = () => {
        setEditingExpense(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (expense: Expense) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    };

    const handleOpenDeleteDialog = (expense: Expense) => {
        setDeletingExpense(expense);
    };

    const handleDeleteExpense = async () => {
        if (!deletingExpense) return;
        try {
            await deleteExpense(Number(deletingExpense.id));
            toast({
                title: "Sucesso!",
                description: "Lançamento excluído com sucesso.",
            });
            setDeletingExpense(null);
            await loadFinancialData();
        } catch (error) {
            console.error("Error deleting expense:", error);
            toast({
                title: "Erro",
                description: "Não foi possível excluir o lançamento. Tente novamente.",
                variant: "destructive",
            });
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingExpense(null);
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Painel Financeiro</h2>
                    <p className="text-muted-foreground">
                        Acompanhe a saúde financeira da sua barbearia.
                    </p>
                </div>
                 <div className={cn("grid gap-2")}>
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

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="transactions">Lançamentos</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Receita Bruta</CardTitle>
                                <HandCoins className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                               {isLoading ? <Skeleton className="h-8 w-32 mb-2" /> : <>
                                    <div className="text-2xl font-bold">{formatCurrency(financialSummary.grossRevenue)}</div>
                                    <p className={`text-xs ${revenueChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {revenueChange.toFixed(1)}% em relação ao período anterior
                                    </p>
                               </>}
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
                                 <TrendingDown className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                               {isLoading ? <Skeleton className="h-8 w-28 mb-2" /> : <>
                                    <div className="text-2xl font-bold">{formatCurrency(financialSummary.totalExpenses)}</div>
                                    <p className={`text-xs ${expensesChange >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                        {expensesChange.toFixed(1)}% em relação ao período anterior
                                    </p>
                               </>}
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                               {isLoading ? <Skeleton className="h-8 w-24 mb-2" /> : <>
                                    <div className="text-2xl font-bold">{formatCurrency(financialSummary.netProfit)}</div>
                                    <p className={`text-xs ${profitChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {profitChange.toFixed(1)}% em relação ao período anterior
                                    </p>
                                </>}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Receita vs. Despesas</CardTitle>
                                <CardDescription>Análise diária no período selecionado.</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                               {isLoading ? (
                                    <Skeleton className="h-[350px] w-full" />
                               ) : revenueVsExpensesData.length > 0 ? (
                                <ChartContainer config={chartConfig} className="h-[350px] w-full">
                                    <ChartBarChart data={revenueVsExpensesData}>
                                        <ChartCartesianGrid vertical={false} />
                                        <ChartXAxis
                                            dataKey="date"
                                            tickLine={false}
                                            tickMargin={10}
                                            axisLine={false}
                                            tickFormatter={(value) => value.substring(0, 5)}
                                        />
                                        <ChartYAxis tickFormatter={(value) => `R$${value}`} />
                                        <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)}/>} />
                                        <ChartLegend content={<ChartLegendContent />} />
                                        <ChartBar dataKey="receita" fill="var(--color-receita)" radius={4} />
                                        <ChartBar dataKey="despesas" fill="var(--color-despesas)" radius={4} />
                                    </ChartBarChart>
                                </ChartContainer>
                               ) : (
                                    <div className="flex h-[350px] w-full flex-col items-center justify-center text-center">
                                         <TrendingUp className="h-10 w-10 text-muted-foreground mb-4"/>
                                         <p className="text-sm text-muted-foreground">Nenhuma receita ou despesa registrada no período.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                         <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Receita por Forma de Pagamento</CardTitle>
                                <CardDescription>Distribuição da receita no período.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <Skeleton className="h-[350px] w-full" />
                                ): paymentMethodData.length > 0 ? (
                                    <ChartContainer config={paymentMethodChartConfig} className="h-[350px] w-full">
                                        <PieChart>
                                            <ChartTooltip
                                                cursor={false}
                                                content={<ChartTooltipContent formatter={(value, name) => `${name}: ${formatCurrency(value as number)}`} hideLabel />}
                                            />
                                            <Pie
                                                data={paymentMethodData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                labelLine={false}
                                                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                                    const RADIAN = Math.PI / 180;
                                                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                                                    if (percent < 0.05) return null; // Don't render label for small slices

                                                    return (
                                                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight="bold">
                                                            {`${(percent * 100).toFixed(0)}%`}
                                                        </text>
                                                    );
                                                }}
                                            >
                                                {paymentMethodData.map((entry) => (
                                                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                                        </PieChart>
                                    </ChartContainer>
                                ) : (
                                    <div className="flex h-[350px] w-full flex-col items-center justify-center text-center">
                                         <WalletCards className="h-10 w-10 text-muted-foreground mb-4"/>
                                         <p className="text-sm text-muted-foreground">Nenhuma receita registrada no período.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="transactions" className="space-y-4">
                    <div className="flex items-center justify-between">
                         <div>
                            <h3 className="text-2xl font-bold tracking-tight">Histórico de Lançamentos</h3>
                            <p className="text-muted-foreground">
                                Visualize e gerencie as despesas.
                            </p>
                        </div>
                        <Button onClick={handleOpenAddModal}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar Lançamento
                        </Button>
                    </div>
                     <Card>
                        <CardContent className="pt-6">
                          <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                                <TableHead><span className="sr-only">Ações</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                    Carregando...
                                    </TableCell>
                                </TableRow>
                                ) : filteredExpenses.length > 0 ? (
                                filteredExpenses.map((expense) => (
                                    <TableRow key={expense.id}>
                                    <TableCell className="font-medium">{expense.description}</TableCell>
                                    <TableCell>{expense.category}</TableCell>
                                    <TableCell>{format(expense.date, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                                    <TableCell className="text-right text-red-600">-{formatCurrency(expense.amount)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleOpenEditModal(expense)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleOpenDeleteDialog(expense)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Excluir
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                    </TableRow>
                                ))
                                ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                    Nenhum lançamento encontrado no período.
                                    </TableCell>
                                </TableRow>
                                )}
                            </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingExpense ? "Editar Lançamento" : "Adicionar Novo Lançamento"}</DialogTitle>
                    </DialogHeader>
                    <ExpenseForm
                        initialData={editingExpense}
                        onSave={handleSaveExpense}
                        onCancel={handleCloseModal}
                    />
                </DialogContent>
            </Dialog>
            <AlertDialog open={!!deletingExpense} onOpenChange={(open) => !open && setDeletingExpense(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação excluirá o lançamento "{deletingExpense?.description}". Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeletingExpense(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteExpense} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Confirmar Exclusão
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

    

    