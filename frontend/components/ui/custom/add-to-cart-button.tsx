"use client";

import api from "@/lib/api";
import { Button } from "../button";
import { toast } from "sonner";
import { useCart } from "@/src/context/cart-context";
import { AddCartItemRequest, InventoryItem } from "@/lib/types";
import { ShoppingCart, ShoppingBasket, SlidersHorizontal } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import {
	FieldSelections,
	getMissingFields,
	isConfigurable,
	toFieldSelectionPayload,
} from "@/lib/field-selections";

/**
 * Add-to-cart button for an inventory item.
 *
 * When the item has configurable fields, the button only adds to the cart
 * once `fieldSelections` is passed (the open product modal) and every
 * required field has a selection. Without `fieldSelections` (the closed
 * product card) it becomes a "Customize" button that calls `onCustomize`,
 * so configurable items can't be ordered without being configured.
 */
export function AddToCartButton({
	item,
	quantity,
	fieldSelections,
	onCustomize,
}: {
	item: InventoryItem;
	quantity: number;
	fieldSelections?: FieldSelections;
	onCustomize?: () => void;
}) {
	const { cart, setCartDrawer } = useCart();
	const { status } = useSession();
	const queryClient = useQueryClient();
	const addCartItem = function(request: AddCartItemRequest) {
		api
			.post("/cartitem", request)
			.then((res) => {
				toast.success("Item successfuly added to cart");
				if (res.data.sessionToken && status === "unauthenticated") {
					signIn("guest", { sessionToken: res.data.sessionToken, redirect: false });
				}
				queryClient.invalidateQueries({ queryKey: ["cart"] });
				setCartDrawer(true);
			})
			.catch((err) => {
				console.log("Error: " + err.message);
				if (err.response?.status === 409) {
					toast.error("Item exists in cart already");
				} else {
					toast.error("Failed to add item to cart");
				}
			});
	};

	// Configurable items can be added once per configuration (the backend merges
	// identical ones), so only plain items short-circuit to "See in cart".
	const inCart = !isConfigurable(item) && cart?.items?.some((i) => i.item.id === item.id);
	const needsCustomizing = isConfigurable(item) && !fieldSelections;
	const missingFields = fieldSelections ? getMissingFields(item, fieldSelections) : [];

	if (inCart) {
		return (
			<Button size="sm" variant="secondary" className="w-full" onClick={() => setCartDrawer(true)}>
				<ShoppingBasket className="size-4" /> See in cart
			</Button>
		);
	}

	if (needsCustomizing) {
		return (
			<Button size="sm" variant="outline" className="w-full" onClick={onCustomize}>
				<SlidersHorizontal className="size-4" /> Customize
			</Button>
		);
	}

	return (
		<div className="flex w-full flex-col gap-1.5">
			<Button
				size="sm"
				className="w-full"
				disabled={missingFields.length > 0}
				onClick={() =>
					addCartItem({
						itemId: item.id,
						quantity,
						inventoryFieldItemSelections: fieldSelections ? toFieldSelectionPayload(item, fieldSelections) : [],
					})
				}
			>
				<ShoppingCart className="size-4" /> Add to cart
			</Button>
			{missingFields.length > 0 && (
				<p className="text-xs text-muted-foreground">
					Choose {missingFields.map((f) => f.label).join(", ")} to continue
				</p>
			)}
		</div>
	);
}
