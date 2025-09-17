"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  PlusCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BarberForm } from "@/components/barber-form";
import { useToast } from "@/hooks/use-toast";


type Barber = {
  id: string;
  name: string;
  specialty: string;
  status: "active" | "inactive";
  notes: string;
};

type ApiBarber = {
  ID: number;
  Nome: string;
  Especialidade: string;
  Status: 'Ativo' | 'Inativo';
  Observacoes: string;
};


type SortKey = keyof Barber;

async function getBarbers(): Promise<Barber[]> {
    try {
        const response = await fetch('https://n8n.mailizjoias.com.br/webhook/barbers');
        if (!response.ok) {
            console.error("Failed to fetch barbers", response.statusText);
            return [];
        }
        const data: ApiBarber[] = await response.json();
        return data.map(item => ({
            id: String(item.ID),
            name: item.Nome,
            specialty: item.Especialidade,
            status: item.Status === 'Ativo' ? 'active' : 'inactive',
            notes: item.Observacoes,
        }));
    } catch (error) {
        console.error("Error fetching barbers:", error);
        return [];
    }
}


export default function BarbersPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const { toast } = useToast();
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "ascending" | "descending";
  } | null>({ key: "name", direction: "ascending" });

  async function loadBarbers() {
    setIsLoading(true);
    const fetchedBarbers = await getBarbers();
    setBarbers(fetchedBarbers);
    setIsLoading(false);
  }

  useEffect(() => {
    loadBarbers();
  }, []);

  const sortedBarbers = [...barbers].sort((a, b) => {
    if (sortConfig === null) {
      return 0;
    }
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key: SortKey) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };
  
  const handleSaveBarber = async (values: any) => {
    try {
      const isEditing = !!editingBarber;
      const url = 'https://n8n.mailizjoias.com.br/webhook/barbers';
      const method = 'POST';
      
      const body = {
        ...(isEditing ? { ID: Number(editingBarber.id) }:{ ID: Number(barbers.length + 1) }),
        Nome: values.name,
        Especialidade: values.specialty,
        Status: values.status === 'active' ? 'Ativo' : 'Inativo',
        Observacoes: values.notes,
      };

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar o barbeiro');
      }
      
      toast({
        title: "Sucesso!",
        description: `Barbeiro ${isEditing ? 'atualizado' : 'salvo'} com sucesso.`,
      });

      setIsModalOpen(false);
      setEditingBarber(null);
      loadBarbers(); // Refresh the list
    } catch (error) {
      console.error("Error saving barber:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o barbeiro. Tente novamente.",
        variant: "destructive",
      });
    }
  };
  
  const handleOpenAddModal = () => {
    setEditingBarber(null);
    setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBarber(null);
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Barbeiros</h2>
          <p className="text-muted-foreground">
            Gerencie os barbeiros da sua equipe.
          </p>
        </div>
        <Button onClick={handleOpenAddModal}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Barbeiro
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => requestSort("name")}
                  className="px-0"
                >
                  Nome
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => requestSort("specialty")}
                  className="px-0"
                >
                  Especialidade
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => requestSort("status")}
                  className="px-0"
                >
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Observações</TableHead>
              <TableHead>
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        Carregando...
                    </TableCell>
                </TableRow>
            ) : sortedBarbers.length > 0 ? (
                sortedBarbers.map((barber) => (
                  <TableRow key={barber.id}>
                    <TableCell className="font-medium">{barber.name}</TableCell>
                    <TableCell>{barber.specialty}</TableCell>
                    <TableCell>
                      <Badge variant={barber.status === "active" ? "default" : "secondary"} className={barber.status === "active" ? "bg-green-500/20 text-green-700 hover:bg-green-500/30" : "bg-gray-500/20 text-gray-700 hover:bg-gray-500/30"}>
                        {barber.status === "active" ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>{barber.notes}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => console.log("Edit", barber.id)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => console.log("Deactivate", barber.id)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Desativar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        Nenhum barbeiro encontrado.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>{editingBarber ? "Editar Barbeiro" : "Adicionar Novo Barbeiro"}</DialogTitle>
            </DialogHeader>
            <BarberForm
                initialData={editingBarber}
                onSave={handleSaveBarber}
                onCancel={handleCloseModal}
            />
        </DialogContent>
    </Dialog>
    </div>
  );
}
