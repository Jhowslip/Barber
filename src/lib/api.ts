import { addMinutes, parse } from 'date-fns';
import { ApiService, Service, ApiBarber, Barber, Appointment, ApiAppointment, ApiConfig } from './types';

const BASE_URL = 'https://n8n.mailizjoias.com.br/webhook';

// Services
export async function getServices(): Promise<Service[]> {
    try {
        const response = await fetch(`${BASE_URL}/servicos`);
        if (!response.ok) {
            throw new Error("Failed to fetch services");
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

export async function saveService(service: Omit<ApiService, 'row_number'>) {
    const response = await fetch(`${BASE_URL}/servicos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(service),
    });
    if (!response.ok) {
        throw new Error('Falha ao salvar o serviço');
    }
    return response.json();
}


// Barbers
export async function getBarbers(): Promise<Barber[]> {
    try {
        const response = await fetch(`${BASE_URL}/barbers`);
        if (!response.ok) {
            throw new Error("Failed to fetch barbers");
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

export async function saveBarber(barber: Omit<ApiBarber, 'row_number'>) {
    const response = await fetch(`${BASE_URL}/barbers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(barber),
    });
    if (!response.ok) {
        throw new Error('Falha ao salvar o barbeiro');
    }
    return response.json();
}

// Appointments
export async function getAppointments(): Promise<Appointment[]> {
    try {
        const [appointmentsResponse, servicesResponse] = await Promise.all([
             fetch(`${BASE_URL}/agenda`),
             fetch(`${BASE_URL}/servicos`)
        ]);

        if (!appointmentsResponse.ok) {
            throw new Error("Failed to fetch appointments");
        }
        if (!servicesResponse.ok) {
            throw new Error("Failed to fetch services for appointments");
        }

        const appointmentsData: ApiAppointment[] = await appointmentsResponse.json();
        const servicesData: ApiService[] = await servicesResponse.json();
        
        const services: Service[] = servicesData.map(item => ({
            id: String(item.ID),
            name: item.Nome,
            price: item.Preço,
            duration: item["Duração (min)"],
            status: item.Status === 'Ativo' ? 'active' : 'inactive'
        }));

        return appointmentsData.map(item => {
            const startDate = parse(`${item.Data} ${item.Hora}`, 'yyyy-MM-dd HH:mm', new Date());
            const service = services.find(s => s.id === String(item.ID_Servico));
            const duration = service ? service.duration : 30; // Default to 30 mins if service not found
            const price = service ? service.price : 0;
            const endDate = addMinutes(startDate, duration);
            
            let status: "confirmed" | "pending" | "canceled";
            switch (item.Status) {
                case "Confirmado": status = "confirmed"; break;
                case "Pendente": status = "pending"; break;
                case "Cancelado": status = "canceled"; break;
                default: status = "pending";
            }

            return {
                id: String(item.ID),
                clientName: item.Cliente,
                clientPhone: item.Telefone_Cliente,
                serviceId: String(item.ID_Servico),
                service: item.Servico,
                price: price,
                barberId: String(item.ID_Barbeiro),
                barber: item.Barbeiro,
                start: startDate,
                end: endDate,
                status: status,
            };
        });
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return [];
    }
}

export async function saveAppointment(appointment: any) {
    const response = await fetch(`${BASE_URL}/agenda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointment),
    });

    if (!response.ok) {
        throw new Error('Falha ao criar o agendamento.');
    }
    return response.json();
}


// Config
export async function getSettings(): Promise<ApiConfig | null> {
    try {
        const response = await fetch(`${BASE_URL}/config`);
        if (!response.ok) {
          throw new Error('Falha ao buscar as configurações.');
        }
        const data: ApiConfig[] = await response.json();
        return data.length > 0 ? data[0] : null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function saveSettings(settings: any) {
    const response = await fetch(`${BASE_URL}/config`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
    });

    if (!response.ok) {
        throw new Error('Falha ao salvar as configurações.');
    }
    return response.json();
}
