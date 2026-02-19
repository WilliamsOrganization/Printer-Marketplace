

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
	imageUrl: string;
	stripeId: string;
	sale: boolean;
	category: Category;
	badge: Badge;
}
