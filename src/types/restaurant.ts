export type TableStatus = 'empty' | 'occupied' | 'reserved';

export interface Table {
    id: string;
    name: string;
    type: 'circle' | 'square' | 'rect';
    status: TableStatus;
    pax: number;
    floor: 1 | 2 | 3;
    x?: number; // Optional coordinates for future mapping
    y?: number;
    customerName?: string;
    time?: string;
    duration?: string;
    notes?: string;
}

export interface FloorZone {
    id: string;
    name: string;
    floor: 1 | 2 | 3;
    type: 'bar' | 'kitchen' | 'waiting' | 'wine' | 'staff' | 'door' | 'restroom';
    x?: number | string;
    y?: number | string;
}

export interface VipRoom {
    id: string;
    name: string;
    capacity: number;
    status: 'empty' | 'in-use';
    customerName?: string;
    time?: string;
    notes?: string;
}

interface SetCourseOption {
    id: string;
    nameEn: string;
    nameVn: string;
    descriptionEn?: string;
    descriptionVn?: string;
}

export interface SetCourse {
    title: string;
    options: SetCourseOption[];
}

export interface SetMenu {
    id: string;
    name: string;
    price: number;
    courses: SetCourse[];
    includedDrink?: string;
    status: 'available' | 'out_of_stock';
}

export interface TourMenu extends SetMenu {
    netPrice: number;
    focPolicy?: string;
    companyTags?: string[];
}
