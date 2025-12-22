import type { Product } from '../../../types';

export type AdminProductsTab = 'list' | 'form' | 'categories';

export type Category = {
    id: string;
    name: string;
    subcategories: string[];
};

export type ProductFormState = Omit<Partial<Product>, 'price' | 'category' | 'subCategory'> & {
    price: number | '';
    category: string;
    subCategory: string;
};
