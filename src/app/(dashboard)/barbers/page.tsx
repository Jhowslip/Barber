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
import { BarberForm } from "@/components/barber-form";
import { useToast } from "@/hooks/use-toast";
import { Barber } from "@/lib/types";
import { getBarbers, saveBarber } from "@/lib/api";


type SortKey = keyof Barber;


export default function BarbersPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [deactivatingBarber, setDeactivatingBarber] = useState<Barber | null>(null);
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
      
      const body = {
        ...(isEditing ? { ID: Number(editingBarber.id) }:{ ID: Number(barbers.length > 0 ? Math.max(...barbers.map(b => parseInt(b.id))) + 1 : 1) }),
        Nome: values.name,
        Especialidade: values.specialty,
        Comissao: values.commission,
        Status: values.status === 'active' ? 'Ativo' : 'Inativo',
        Observacoes: values.notes,
      };

      await saveBarber(body);

      toast({
        title: "Sucesso!",
        description: `Barbeiro ${isEditing ? 'atualizado' : 'adicionado'} com sucesso.`,
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

  const handleDeactivateBarber = async () => {
    if (!deactivatingBarber) return;

    try {
      await saveBarber({
        ID: Number(deactivatingBarber.id),
        Nome: deactivatingBarber.name,
        Especialidade: deactivatingBarber.specialty,
        Comissao: deactivatingBarber.commission,
        Status: 'Inativo',
        Observacoes: deactivatingBarber.notes,
      });


      toast({
        title: "Sucesso!",
        description: "Barbeiro desativado com sucesso.",
      });

      setDeactivatingBarber(null);
      loadBarbers(); // Refresh the list
    } catch (error) {
      console.error("Error deactivating barber:", error);
      toast({
        title: "Erro",
        description: "Não foi possível desativar o barbeiro. Tente novamente.",
        variant: "destructive",
      });
    }
  };
  
  const handleOpenAddModal = () => {
    setEditingBarber(null);
    setIsModalOpen(true);
  }

  const handleOpenEditModal = (barber: Barber) => {
    setEditingBarber(barber);
    setIsModalOpen(true);
  }
  
  const handleOpenDeactivateDialog = (barber: Barber) => {
    setDeactivatingBarber(barber);
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
                  onClick={() => requestSort("commission")}
                  className="px-0"
                >
                  Comissão (%)
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
                    <TableCell colSpan={6} className="h-24 text-center">
                        Carregando...
                    </TableCell>
                </TableRow>
            ) : sortedBarbers.length > 0 ? (
                sortedBarbers.map((barber) => (
                  <TableRow key={barber.id}>
                    <TableCell className="font-medium">{barber.name}</TableCell>
                    <TableCell>{barber.specialty}</TableCell>
                    <TableCell>{barber.commission}%</TableCell>
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
                            onClick={() => handleOpenEditModal(barber)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleOpenDeactivateDialog(barber)}
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
                    <TableCell colSpan={6} className="h-24 text-center">
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
     <AlertDialog open={!!deactivatingBarber} onOpenChange={(open) => !open && setDeactivatingBarber(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
                Esta ação desativará o barbeiro "{deactivatingBarber?.name}". Você poderá reativá-lo depois se necessário.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeactivatingBarber(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivateBarber}>Confirmar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </div>
  );
}
