import { supabase } from '../lib/supabase';
import type { SetMenu } from '../types';
import type { Category, MenuItem } from '../types/menu';

export const menuService = {
    // Categories
    async getCategories() {
        const { data, error } = await supabase
            .from('menu_categories')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) {
            console.error('Error fetching categories:', error);
            return [];
        }

        // We also need counts. So we better fetch items too, or rely on client side filtering.
        // Client side filtering is easier since we will fetch all items anyway.
        return data.map(cat => ({
            id: cat.id,
            name: cat.name,
            count: 0 // Will map on client
        }));
    },

    // Menu Items (A La Carte)
    async getMenuItems() {
        const { data, error } = await supabase
            .from('menu_items')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching menu items:', error);
            return [];
        }
        return data.map(item => ({
            id: item.id,
            categoryId: item.category_id,
            name: item.name,
            description: item.description,
            price: item.price,
            image: item.image,
            inStock: item.in_stock,
            tags: item.tags || [],
            variants: item.variants || []
        }));
    },

    async createMenuItem(item: Omit<MenuItem, 'id'>) {
        const payload = {
            category_id: item.categoryId,
            name: item.name,
            description: item.description,
            price: item.price,
            image: item.image,
            in_stock: item.inStock,
            tags: item.tags,
            variants: item.variants
        };

        const { data, error } = await supabase
            .from('menu_items')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;
        return {
            id: data.id,
            categoryId: data.category_id,
            name: data.name,
            description: data.description,
            price: data.price,
            image: data.image,
            inStock: data.in_stock,
            tags: data.tags || [],
            variants: data.variants || []
        };
    },

    async updateMenuItem(id: string, updates: Partial<MenuItem>) {
        const payload: any = {};
        if (updates.categoryId !== undefined) payload.category_id = updates.categoryId;
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.price !== undefined) payload.price = updates.price;
        if (updates.image !== undefined) payload.image = updates.image;
        if (updates.inStock !== undefined) payload.in_stock = updates.inStock;
        if (updates.tags !== undefined) payload.tags = updates.tags;
        if (updates.variants !== undefined) payload.variants = updates.variants;

        const { error } = await supabase
            .from('menu_items')
            .update(payload)
            .eq('id', id);

        if (error) throw error;
    },

    async updateItemStock(id: string, inStock: boolean) {
        const { error } = await supabase
            .from('menu_items')
            .update({ in_stock: inStock })
            .eq('id', id);
        if (error) throw error;
    },

    async deleteMenuItem(id: string) {
        const { error } = await supabase
            .from('menu_items')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Set Menus
    async getSetMenus() {
        const { data, error } = await supabase
            .from('set_menus')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching set menus:', error);
            return [];
        }

        return data.map(set => ({
            id: set.id,
            name: set.name,
            price: set.price,
            status: set.status,
            includedDrink: set.included_drink,
            courses: set.courses || []
        }));
    },

    async createSetMenu(setMenu: Omit<SetMenu, 'id'>) {
        const payload = {
            name: setMenu.name,
            price: setMenu.price,
            status: setMenu.status,
            included_drink: setMenu.includedDrink,
            courses: setMenu.courses
        };

        const { data, error } = await supabase
            .from('set_menus')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;
        return {
            id: data.id,
            name: data.name,
            price: data.price,
            status: data.status,
            includedDrink: data.included_drink,
            courses: data.courses || []
        };
    },

    async updateSetMenu(id: string, updates: Partial<SetMenu>) {
        const payload: any = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.price !== undefined) payload.price = updates.price;
        if (updates.status !== undefined) payload.status = updates.status;
        if (updates.includedDrink !== undefined) payload.included_drink = updates.includedDrink;
        if (updates.courses !== undefined) payload.courses = updates.courses;

        const { error } = await supabase
            .from('set_menus')
            .update(payload)
            .eq('id', id);

        if (error) throw error;
    },

    async deleteSetMenu(id: string) {
        const { error } = await supabase
            .from('set_menus')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Subscriptions
    subscribeToMenuChanges(callback: () => void) {
        const categoriesSub = supabase
            .channel('menu_categories_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_categories' }, callback)
            .subscribe();

        const itemsSub = supabase
            .channel('menu_items_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, callback)
            .subscribe();

        const setMenusSub = supabase
            .channel('set_menus_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'set_menus' }, callback)
            .subscribe();

        return () => {
            supabase.removeChannel(categoriesSub);
            supabase.removeChannel(itemsSub);
            supabase.removeChannel(setMenusSub);
        };
    }
};
