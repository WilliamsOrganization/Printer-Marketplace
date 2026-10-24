export interface AuthResponse {
	sessionToken: string;
	userId: number;
}

export const COLOR_VARIANTS: Record<string, string> = {
	red: "#e63946",
	green: "#2a9d8f",
	blue: "#457b9d",
	yellow: "#e9b456",
	orange: "#f48024",
	purple: "#a855f7",
	pink: "#f66d9b",
	gray: "#6e6e6e",
	brown: "#9c8866",
	cyan: "#5fb3b3",
	magenta: "#d16d9e",
	indigo: "#4f46e5",
	violet: "#a946f6",
};
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

// ── Inventory Item Field types ──────────────────────────────────────────
// Mirrors the backend single-table inheritance hierarchy for
// InventoryItemField / InventoryItemFieldOptions.

// Matches backend Color - the global palette every 3MF region picks from.
export interface Color {
	id: number;
	name: string;
	/** Uppercase #RRGGBB */
	hex: string;
	isDisabled: boolean;
	isDeleted: boolean;
}

export interface InventoryItemFieldOption {
	id: number;
	label: string;
	price: number;
}

// One color a 3MF region is offered in.
export interface InventoryItemFieldThreeMFOption extends InventoryItemFieldOption {
	selectedColor: Color;
}

// One color slot (3MF pindex) of a 3MF file. The customer picks exactly one
// of its options.
export interface InventoryItemFieldThreeMFRegion {
	id: number;
	slotIndex: number;
	name: string;
	options: InventoryItemFieldThreeMFOption[];
}

export type FieldType = "checklist" | "radio_group" | "three_mf_color_picker";

export interface InventoryItemField {
	id: number;
	label: string;
	description: string;
	field_type: FieldType;
	// TODO: drop once the admin field dialog uploads 3MF files instead of STL
	stlUrl?: string;
	/** Only on three_mf_color_picker fields */
	threeMFUrl?: string;
	/** Only on three_mf_color_picker fields. `options` is every region's options flattened. */
	regions?: InventoryItemFieldThreeMFRegion[];
	options: InventoryItemFieldOption[];
}

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
	sale: boolean;
	isArchived: boolean;
	sizeCategory: SizeCategory;
	weightCategory: WeightCategory;
	fields: InventoryItemField[] | null;
}
// One configured field sent with POST /cartitem. optionIds are
// InventoryItemFieldOptions ids from the item's fields.
export interface InventoryItemFieldSelection {
	fieldId: number;
	optionIds: number[];
}

// Matches backend AddCartItemRequest
export interface AddCartItemRequest {
	itemId: number;
	quantity: number;
	inventoryFieldItemSelections: InventoryItemFieldSelection[];
}

export interface CartItem {
	id: number;
	createdAt: string;
	updatedAt: string;
	cart: Cart;
	item: InventoryItem;
	quantity: number;
	/** Dollars per unit: item cost plus every selected option (CartItem.getUnitPrice). */
	unitPrice: number;
	cartItemFields: SelectedField[];
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


export interface StripeCatalogRequest {
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

// A field the customer configured, as stored on a cart or order line.
export interface SelectedField {
	label: string;
	options: { label: string }[];
}

// Snapshot of one option the customer chose, copied into the order at checkout.
export interface OrderItemFieldOption {
	id: number;
	label: string;
	price: number;
	// Only present on 3MF region options
	selectedColor?: Color;
}

// Snapshot of one configured field on an order line.
export interface OrderItemField {
	id: number;
	label: string;
	description: string;
	options: OrderItemFieldOption[];
}

export interface OrderItem {
	id: number;
	item: InventoryItem;
	quantity: number;
	itemTitle: string;
	unitPrice: number;
	configurationKey: string;
	orderItemFields: OrderItemField[];
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
	fromLat: number | null;
	fromLng: number | null;
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
	cardholderName: string | null;
	status: OrderStatus;
}

export enum ReturnStatus {
	PENDING = "PENDING",
	CANCELLED = "CANCELLED",
	REFUNDED = "REFUNDED",
}

export interface Returns {
	id: number;
	requestedDate: string;
	orderId: number;
	orderStripeSessionId: string;
	itemsToReturn: OrderItem[];
	reasonForReturn: string;
	status: ReturnStatus;
	refundedAmount: number | null;
	refundedAt: string | null;
	reviewed: boolean;
	Chat: Chat | null;
}

export interface Chat {
	id: number;
	createdAt: string;
	updatedAt: string;
	admin: User;
	customer: User;
	messages: ChatMessage[];
}

export enum ChatMessageType {
	CHAT = "CHAT",
	JOIN = "JOIN",
	LEAVE = "LEAVE",
}

export interface ChatMessage {
	type: ChatMessageType;
	content: string;
	createdAt: string;
	sender: boolean;
	id: string;
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
