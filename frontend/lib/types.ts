export interface AuthResponse {
	sessionToken: string;
	userId: number;
}
// Values must match InventoryItem.SizeCategory's Java constant names exactly
// (Jackson serializes enums by .name()) - backend is the source of truth.
export enum SizeCategory {
	SIZE_2X2 = "SIZE_2X2",
	SIZE_4X5 = "SIZE_4X5",
	SIZE_5X7 = "SIZE_5X7",
	SIZE_8X10 = "SIZE_8X10",
	SIZE_11X14 = "SIZE_11X14",
	SIZE_16X20 = "SIZE_16X20",
	SIZE_20X30 = "SIZE_20X30",
}
export const SizeCategoryLabel: Record<SizeCategory, string> = {
	[SizeCategory.SIZE_2X2]: "2 x 2 cm",
	[SizeCategory.SIZE_4X5]: "4 x 5 cm",
	[SizeCategory.SIZE_5X7]: "5 x 7 cm",
	[SizeCategory.SIZE_8X10]: "8 x 10 cm",
	[SizeCategory.SIZE_11X14]: "11 x 14 cm",
	[SizeCategory.SIZE_16X20]: "16 x 20 cm",
	[SizeCategory.SIZE_20X30]: "20 x 30 cm",
};

// Values must match InventoryItem.WeightCategory's Java constant names
// exactly - backend is the source of truth.
export enum WeightCategory {
	LIGHT = "LIGHT",
	MEDIUM = "MEDIUM",
	HEAVY = "HEAVY",
	EXTRA_HEAVY = "EXTRA_HEAVY",
}
export const WeightCategoryLabel: Record<WeightCategory, string> = {
	[WeightCategory.LIGHT]: "Light (~100g)",
	[WeightCategory.MEDIUM]: "Medium (~500g)",
	[WeightCategory.HEAVY]: "Heavy (~1kg)",
	[WeightCategory.EXTRA_HEAVY]: "Extra Heavy (~2kg)",
};

export interface InventoryItem {
	id: number;
	createdAt: string;
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
	sizeCategory: SizeCategory;
	weightCategory: WeightCategory;
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
	actualShippingCost: number | null;
	serviceType: string;
	easyPostId: string;
	trackingNumber: string;
	trackingUrl: string;
	labelPdfUrl: string;
	addressFrom: ShippingAddress;
	addressTo: ShippingAddress;
	lat: number | null;
	lng: number | null;
	currentLocation: ShippingAddress | null;
	currentLat: number | null;
	currentLng: number | null;
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

export interface DailyMetric {
	date: string;
	value: number;
}

export interface OrdersDailyMetric {
	date: string;
	totalOrders: number;
	completedOrders: number;
}

export interface PopularItem {
	itemTitle: string;
	quantity: number;
}

// Matches backend DashboardAnalyticsResponse - server-side aggregation for
// the admin dashboard home page and analytics page (GET /analytics/dashboard,
// admin-only).
export interface DashboardAnalyticsResponse {
	inventoryActiveCount: number;
	inventoryArchivedCount: number;
	totalSessions: number;
	activeSessions: number;
	uniqueSessionUsers: number;
	totalAccounts: number;
	sessionGrowthRatePercent: number | null;
	sessionsByDate: DailyMetric[];

	totalRevenueCents: number;
	successfulOrderCount: number;
	totalOrderCount: number;
	registeredUserCount: number;
	repeatPurchaseRatePercent: number;
	revenueByDate: DailyMetric[];
	ordersByDate: OrdersDailyMetric[];
	registeredUsersByDate: DailyMetric[];
	popularItems: PopularItem[];
}
