import { Client } from "./client";
import { Agent } from "./agent";
import { Carrier } from "./carrier";

export interface Sale {
  id: number;
  agent_id: number;
  client_id: number;
  client: Client;
  agent: Agent;
  product: string;
  carrier?: string;
  // Update this property name to match JSON: 
  carrier_info?: Carrier;
  total_sale_amount: number;
  commission: number;
  sale_date: string;
  status: "Waiting for Funds" | "Waiting for Documents" | "Processing" | "Waiting for Carrier" | "Completed" | "Cancelled";
  created_at: string;
  updated_at: string;
}
