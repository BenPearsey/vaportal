import { Agent } from './agent'

export interface Client {
  client_id: number;
  user_id?: number;
  agent_id?: number;
  agent?: Agent;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;  
  zipcode?: string;
  dob?: string;
  status: 'Prospect' | 'Active' | 'Inactive'; 
  created_at: string;
  updated_at: string;
    bank_name: string;
  account_type: string;
  account_holder: string;
  routing_number: string;
  account_number: string;
}

export interface PageProps {
  clients?: Client[];
  errors?: Record<string, string>;
}