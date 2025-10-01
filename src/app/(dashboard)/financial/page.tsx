
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";

export default function FinancialPage() {

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
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar Lançamento
                        </Button>
                    </div>
                     <Card>
                        <CardContent className="pt-6">
                           <Skeleton className="h-[400px] w-full" />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
