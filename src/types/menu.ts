export interface Category {
    id: string;
    name: string;
    count: number;
}

export interface MenuItem {
    id: string;
    categoryId: string;
    name: string;
    description: string;
    price: number;
    image: string;
    inStock: boolean;
    tags: string[];
    variants?: string[];
}
