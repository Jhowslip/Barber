"use client";

import { useState } from "react";
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

type Barber = {
  id: string;
  name: string;
  specialty: string;
  status: "active" | "inactive";
  notes: string;
};

const initialBarbers: Barber[] = [
  { id: "1", name: "João Silva", specialty: "Corte Clássico", status: "active", notes: "Excelente com crianças." },
  { id: "2", name: "Carlos Pereira", specialty: "Barba", status: "active", notes: "Especialista em barba terapia." },
  { id: "3", name: "Miguel Santos", specialty: "Corte Moderno", status: "inactive", notes: "Em treinamento." },
  { id: "4", name: "Lucas Souza", specialty: "Navalha", status: "active", notes: "" },
  { id: "5", name: "André Costa", specialty: "Todos os estilos", status: "active", notes: "Barbeiro sênior." },
];

type SortKey = keyof Barber;

export default function BarbersPage() {
  const [barbers, setBarbers] = useState<Barber[]>(initialBarbers);
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "ascending" | "descending";
  } | null>({ key: "name", direction: "ascending" });

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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Barbeiros</h2>
          <p className="text-muted-foreground">
            Gerencie os barbeiros da sua equipe.
          </p>
        </div>
        <Button>Adicionar Barbeiro</Button>
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
            {sortedBarbers.map((barber) => (
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
