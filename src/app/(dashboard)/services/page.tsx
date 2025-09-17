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

type Service = {
  id: string;
  name: string;
  price: number;
  duration: number;
  status: "active" | "inactive";
};

type ApiService = {
  ID: number;
  Nome: string;
  Preço: number;
  "Duração (min)": number;
  Status: "Ativo" | "Desativado";
};

type SortKey = keyof Service;

async function getServices(): Promise<Service[]> {
    try {
        const response = await fetch('https://n8n.mailizjoias.com.br/webhook/servicos');
        if (!response.ok) {
            console.error("Failed to fetch services", response.statusText);
            return [];
        }
        const data: ApiService[] = await response.json();
        return data.map(item => ({
            id: String(item.ID),
            name: item.Nome,
            price: item.Preço,
            duration: item["Duração (min)"],
            status: item.Status === 'Ativo' ? 'active' : 'inactive'
        }));
    } catch (error) {
        console.error("Error fetching services:", error);
        return [];
    }
}


export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "ascending" | "descending";
  } | null>({ key: "name", direction: "ascending" });

  useEffect(() => {
    async function loadServices() {
      setIsLoading(true);
      const fetchedServices = await getServices();
      setServices(fetchedServices);
      setIsLoading(false);
    }
    loadServices();
  }, []);

  const sortedServices = [...services].sort((a, b) => {
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Serviços</h2>
          <p className="text-muted-foreground">
            Gerencie os serviços oferecidos pela sua barbearia.
          </p>
        </div>
        <Button>Adicionar Serviço</Button>
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
                  Nome do Serviço
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => requestSort("price")}
                  className="px-0"
                >
                  Preço
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => requestSort("duration")}
                  className="px-0"
                >
                  Duração (min)
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
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
            ) : sortedServices.length > 0 ? (
              sortedServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{formatCurrency(service.price)}</TableCell>
                  <TableCell>{service.duration}</TableCell>
                  <TableCell>
                    <Badge variant={service.status === "active" ? "default" : "secondary"} className={service.status === "active" ? "bg-green-500/20 text-green-700 hover:bg-green-500/30" : "bg-gray-500/20 text-gray-700 hover:bg-gray-500/30"}>
                      {service.status === "active" ? "Ativo" : "Desativado"}
                    </Badge>
                  </TableCell>
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
                          onClick={() => console.log("Edit", service.id)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => console.log("Deactivate", service.id)}
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
                        Nenhum serviço encontrado.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
