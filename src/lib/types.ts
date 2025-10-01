export type Service = {
  id: string;
  name: string;
  price: number;
  duration: number;
  status: "active" | "inactive";
};

export type ApiService = {
  ID: number;
  Nome: string;
  Preço: number;
  "Duração (min)": number;
  Status: "Ativo" | "Desativado";
};

export type Barber = {
  id: string;
  name: string;
  specialty: string;
  status: "active" | "inactive";
  notes: string;
  commission: number;
};

export type ApiBarber = {
  ID: number;
  Nome: string;
  Especialidade: string;
  Status: 'Ativo' | 'Inativo';
  Observacoes: string;
  Comissao: number;
};

export type Appointment = {
  id: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  service: string;
  price: number;
  barberId: string;
  barber: string;
  start: Date;
  end: Date;
  status: "confirmed" | "pending" | "canceled";
  paymentMethod?: string;
};

export type ApiAppointment = {
  ID: number;
  Data: string;
  Hora: string;
  Cliente: string;
  Telefone_Cliente: string;
  ID_Servico: number;
  Servico: string;
  ID_Barbeiro: number;
  Barbeiro: string;
  Status: "Confirmado" | "Pendente" | "Cancelado";
  Forma_Pagamento?: string;
};


export type ApiConfig = {
  Nome_Barbearia: string;
  Telefone_Principal: string;
  Endereco: string;
  Horario_Funcionamento: string;
  Formas_Pagamento: string;
  Responder_Audio: string;
  Enviar_Reacoes: string;
};
