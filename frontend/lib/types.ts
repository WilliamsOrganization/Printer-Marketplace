export interface AuthResponse {
	sessionToken: string;
	userId: number;
}
export enum Category {
	ELECTRONICS = "ELECTRONICS",
	PRINTS = "PRINTS",
	CUSTOM = "CUSTOM",
}
export const CategoryLabel: Record<Category, string> = {
	[Category.CUSTOM]: "Custom",
	[Category.ELECTRONICS]: "Electronics",
	[Category.PRINTS]: "Prints",
};

export enum ItemBadge {
	BESTSELLER = "BESTSELLER",
	NEW = "NEW",
	SALE = "SALE",
}

export interface InventoryItem {
	id: number;
	itemTitle: string;
	itemDescription: string;
	itemCost: number;
	quantity: number;
	currency: string;
	imageUrls: string[];
	stripeProductId: string;
	stripePriceId: string;
	sale: boolean;
	isArchived: boolean;
	category: Category;
	badge: ItemBadge;
}
export interface CartItem {
	id: number;
	createdAt: string;
	updatedAt: string;
	cart: Cart;
	item: InventoryItem;
	quantity: number;
}
export interface Cart {
	id: number;
	createdAt: string;
	updatedAt: string;
	user: User;
	items: CartItem[];
}


export interface StripeCatalogRequest{
	name: string,
	description: string,
	unitAmount: number,
	currency: string,
	stockQty: number
}

export enum UserRole {
	CUSTOMER = "CUSTOMER",
	REGISTERED = "REGISTERED",
	ADMIN = "ADMIN",
}

export interface User {
	id: number;
	createdAt: string;
	updatedAt: string;
	email: string;
	phoneNumber: string;
	password: string;
	isAdmin: boolean;
	userRole: UserRole;
}

export interface ImageDropFieldProps {
	name: string;
	required?: boolean;
	accept?: Record<string, string[]>;
	maxFiles?: number;
	maxSize?: number;
	value?: File[];
	onChange?: (files: File[]) => void;
	className?: string;
	disabled?: boolean;
}
