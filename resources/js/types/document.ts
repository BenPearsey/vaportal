export interface ClientDocument {
  id: number;
  client_id: number;
  path: string;
  title?: string;  // Add this line
  created_at: string;
  updated_at: string;
}
