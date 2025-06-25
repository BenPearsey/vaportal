export type Admin = {
    id: number;
    firstname: string;
    lastname: string;
};

export type Agent = {
    id: number;
    firstname: string;
    lastname: string;
    upline_agent_id?: number;
};

export type Client = {
    id: number;
    firstname: string;
    lastname: string;
    agent_id: number;
};

export type User = {
    id: number;
    email: string;
    avatar?: string;
    admin?: Admin | null;
    agent?: Agent | null;
    client?: Client | null;
};
