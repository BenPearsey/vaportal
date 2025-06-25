export interface ResourceFolder {
    id: number;
    name: string;
    parent_id: number | null;
    published_for_agents: boolean;
    published_for_clients: boolean;
    // children?: ResourceFolder[]  <-- optional if you eager‑load
  }
  
  export interface ResourceDocument {
    id: number;
    folder_id: number | null;
    title: string;
    path: string;
    published_for_agents: boolean;
    published_for_clients: boolean;
  }
  