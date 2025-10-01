
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, MoreHorizontal } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { getExpenses, saveExpense } from "@/lib/api";
import { Expense } from "@/lib/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ExpenseForm } from "@/components/expense-form";

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
};

export default function FinancialPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const { toast } = useToast();

    async function loadExpenses() {
        setIsLoading(true);
        const fetchedExpenses = await getExpenses();
        // Sort by most recent date
        const sortedExpenses = fetchedExpenses.sort((a, b) => b.date.getTime() - a.date.getTime());
        setExpenses(sortedExpenses);
        setIsLoading(false);
    }
    
    useEffect(() => {
        loadExpenses();
    }, []);

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
            await loadExpenses();
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
                                <span className="text-2xl">💰</span>
                            </CardHeader>
                            <CardContent>
                               <Skeleton className="h-8 w-32 mb-2" />
                               <Skeleton className="h-4 w-48" />
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
                                 <span className="text-2xl">💸</span>
                            </CardHeader>
                            <CardContent>
                               <Skeleton className="h-8 w-28 mb-2" />
                               <Skeleton className="h-4 w-48" />
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
                                <span className="text-2xl">📈</span>
                            </CardHeader>
                            <CardContent>
                               <Skeleton className="h-8 w-24 mb-2" />
                               <Skeleton className="h-4 w-48" />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Receita vs. Despesas</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <Skeleton className="h-[350px] w-full" />
                            </CardContent>
                        </Card>
                         <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Receita por Forma de Pagamento</CardTitle>
                            </CardHeader>
                            <CardContent>
                               <Skeleton className="h-[350px] w-full" />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="transactions" className="space-y-4">
                    <div className="flex items-center justify-between">
                         <div>
                            <h3 className="text-2xl font-bold tracking-tight">Histórico de Lançamentos</h3>
                            <p className="text-muted-foreground">
                                Visualize e gerencie as despesas e receitas.
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
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                    Carregando...
                                    </TableCell>
                                </TableRow>
                                ) : expenses.length > 0 ? (
                                expenses.map((expense) => (
                                    <TableRow key={expense.id}>
                                    <TableCell className="font-medium">{expense.description}</TableCell>
                                    <TableCell>{expense.category}</TableCell>
                                    <TableCell>{format(expense.date, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                                    </TableRow>
                                ))
                                ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                    Nenhum lançamento encontrado.
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
        </div>
    );
}
