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

export interface User {
	email: string;
	phoneNumber: string;
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

export enum OrderStatus {
	PENDING = "PENDING",
	COMPLETED = "COMPLETED",
	PAID = "PAID",
	EXPIRED = "EXPIRED",
	FAILED = "FAILED",
}

export interface OrderItem {
	id: number;
	item: InventoryItem;
	quantity: number;
	itemTitle: string;
	unitPrice: number;
}

export interface ShippingAddress {
	name: string;
	street1: string;
	street2: string;
	city: string;
	state: string;
	zip: string;
	country: string;
}

export enum ShippingStatus {
	PENDING = "PENDING",
	PURCHASED = "PURCHASED",
	IN_TRANSIT = "IN_TRANSIT",
	DELIVERED = "DELIVERED",
}

export interface Shipping {
	id: number;
	createdAt: string;
	shippingCost: number;
	serviceType: string;
	easyPostId: string;
	trackingNumber: string;
	trackingUrl: string;
	labelPdfUrl: string;
	addressFrom: ShippingAddress;
	addressTo: ShippingAddress;
	status: ShippingStatus;
}

export interface Orders {
	id: number;
	date: string;
	user: User;
	items: OrderItem[];
	shipping: Shipping | null;
	stripeSessionId: string;
	email: string;
	subtotal: number;
	shippingCost: number;
	total: number;
	currency: string;
	status: OrderStatus;
}

export interface CheckoutSummary {
	status: string;
	customerEmail: string;
	amountTotal: number;
	currency: string;
}

export interface OrderResponse {
	order: Orders;
	session: CheckoutSummary;
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
