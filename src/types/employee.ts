export interface Employee {
    id: string;
    name: string;
    email: string;
    active: boolean;
    roles: {
        reception: boolean;
        kitchen: boolean;
        server: boolean;
        manager: boolean;
    };
    lastActive?: string;
}

export interface ActivityLog {
    id: string;
    action: string;
    timestamp: string;
    details: string;
}

export interface Area {
    id: string;
    name: string;
    capacity: number;
}
