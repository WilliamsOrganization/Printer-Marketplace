

export interface AuthResponse { 
	sessionToken: string;
	userId: number;
}
export enum Category {
	ELECTRONICS = "ELECTRONICS",
	PRINTS = "PRINTS",
	CUSTOM = "CUSTOM",
}

export enum Badge {
	BESTSELLER = "BESTSELLER",
	NEW = "NEW",
	SALE = "SALE",
}

export interface InventoryItem {
	id: number;
	itemTitle: string;
	item: string;
	itemCost: number;
	imageUrl: string[];
	stripeId: string;
	sale: boolean;
	category: Category;
	badge: Badge;
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
