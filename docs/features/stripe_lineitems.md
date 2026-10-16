# Just so you dont have to rediscover this later:
## aka dont rewrite stripe. just pass in configuration options at the time of order
use the new fields api that you just created to do all of this for you. 

when creating a checkout session if instead of passing it a lineitem id. you give it 
```json
  price_data: {
    currency: 'usd',
    unit_amount: 4000,              // in cents
    product: 'prod_ABC123',         // OR product_data: { name: 'Custom Print' }
  } 
```


This is in javascript but the Java version of the api will likely be exactly the same. 
just use the same effective .builder() for the required parameters. 
```javascript
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;

import java.util.Map;

SessionCreateParams params = SessionCreateParams.builder()
    .setMode(SessionCreateParams.Mode.PAYMENT)
    .addLineItem(
        SessionCreateParams.LineItem.builder()
            .setQuantity(1L)
            .setPriceData(
                SessionCreateParams.LineItem.PriceData.builder()
                    .setCurrency("usd")
                    .setUnitAmount(calculatePrice(config)) // long, in cents
                    .setProduct("prod_ABC123")
                    .build()
            )
            .build()
    )
    .putAllMetadata(config) // Map<String, String> — see note below
    .setSuccessUrl("https://example.com/success")
    .setCancelUrl("https://example.com/cart")
    .build();

Session session = Session.create(params);
```

## Database migration for configurable cart items (2026-10-05)
A fresh database doesn't need any of this: `ddl-auto=update` builds the new schema from the entities.
Run it once on any database created before this change (local, prod), before or after starting the new backend.
`ddl-auto=update` never drops old constraints or tables, so without it adding two configurations of the
same product fails with a duplicate key error on `cart_item` / `order_item`.

What changed:
- inventory options point at their field (`inventory_item_field_id`) instead of one join table per field type
- `cart_item` and `order_item` are unique per (cart/order, item, `configuration_key`) instead of per (cart/order, item)

```sql
BEGIN;

-- 1. Options now point at their field (was: one join table per field type).
ALTER TABLE inventory_item_field_options ADD COLUMN IF NOT EXISTS inventory_item_field_id bigint;

UPDATE inventory_item_field_options o SET inventory_item_field_id = j.radio_group_id
FROM inventory_radio_group_options j
WHERE j.options_id = o.id AND o.inventory_item_field_id IS NULL;

UPDATE inventory_item_field_options o SET inventory_item_field_id = j.checklist_id
FROM inventory_checklist_options j
WHERE j.options_id = o.id AND o.inventory_item_field_id IS NULL;

UPDATE inventory_item_field_options o SET inventory_item_field_id = j.color_picker_id
FROM inventory_color_picker_options j
WHERE j.options_id = o.id AND o.inventory_item_field_id IS NULL;

-- 2. Drop the old "one row per product" constraints. Found by column set because
--    Hibernate generates the names. Hibernate adds the
--    (..., item_id, configuration_key) replacements on startup.
DO $$
DECLARE
    target record;
    con text;
BEGIN
    FOR target IN
        SELECT * FROM (VALUES
            ('cart_item',  ARRAY['cart_id', 'item_id']),
            ('order_item', ARRAY['item_id', 'orders_id'])
        ) AS t(tbl, cols)
    LOOP
        SELECT c.conname INTO con
        FROM pg_constraint c
        WHERE c.conrelid = target.tbl::regclass
          AND c.contype = 'u'
          AND (SELECT array_agg(a.attname::text ORDER BY a.attname)
               FROM unnest(c.conkey) k
               JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = k) = target.cols;
        IF con IS NOT NULL THEN
            EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', target.tbl, con);
        END IF;
    END LOOP;
END $$;

COMMIT;
```

Check step 1 worked. This should return 0, anything else is an option that customers can't select:
```sql
SELECT count(*) FROM inventory_item_field_options WHERE inventory_item_field_id IS NULL;
```

Then clean up what the code no longer uses:
```sql
DROP TABLE inventory_radio_group_options;
DROP TABLE inventory_checklist_options;
DROP TABLE inventory_color_picker_options;

-- leftover from the old CartItem -> OrderItemField mapping, nothing writes it anymore
ALTER TABLE order_item_field DROP COLUMN IF EXISTS cart_item_id;
```

## Configurable items refactor (commit 351567b7)
Customers can now pick options (size, add-ons, STL color) on a product, put several different
configurations of the same product in their cart, and pay for exactly what they picked.
The chosen options follow the item all the way to Stripe, the order, and the confirmation email.

### Three layers, each with its own copy
```
InventoryItemField*   what CAN be chosen (admin defines it, source of truth)
        |  copied when added to cart    CartItemFieldOptions*.from(inventoryOption)
        v
CartItemField*        what WAS chosen, at the price it had when added
        |  copied at checkout           OrderItemField.from(cartField)
        v
OrderItemField*       what was PAID for, never changes after checkout
```
Each layer has the same shape: a field base class (`RadioGroup`, `Checklist`, `ColorPicker`) and an
options base class (`OptionsDropdown`, `OptionsStlColor`). Cart and order hold copies on purpose:
an order must keep showing what the customer paid even if the admin edits or deletes the option later.

- `CartItem.cartItemFields`: the cart line's selections
- `OrderItem.orderItemFields`: the order line's selections
- `CartItemFieldOptionsStlColor` / `OrderItemFieldOptionsStlColor` carry `selectedColor` + `stlUrl`.
  On inventory the `stlUrl` lives on the color picker field; it's copied down onto each cart/order option.

### Inventory options now point at their field
`InventoryItemFieldOptions.inventoryItemField` (`@ManyToOne`, column `inventory_item_field_id`)
replaces the old per-type join tables (`inventory_radio_group_options`, ...). The fields side is
`@OneToMany(mappedBy = "inventoryItemField")`.
- JSON: `@JsonManagedReference` on each field's `options` list (parent), `@JsonBackReference` on the
  option's `inventoryItemField` (child). Jackson fills in the back reference when the admin posts a field,
  so nothing in the services sets it by hand.
- This is what makes `InventoryItemFieldOptionsRepository.findByIdInAndInventoryItemField(ids, field)` work:
  it returns only the requested options that actually belong to that field.

### Adding to the cart: `POST /cartitem`
```json
{ "itemId": 12, "quantity": 1,
  "inventoryFieldItemSelections": [ { "fieldId": 7, "optionIds": [5] }, { "fieldId": 8, "optionIds": [12, 13] } ] }
```
Built by `toFieldSelectionPayload` in `frontend/lib/field-selections.ts`. The JSON key has to match the
record component name in `AddCartItemRequest` exactly, otherwise Jackson silently drops it and the backend
sees no selections.

`CartService.createCartItem` -> `validateFieldSelections` checks, in order:
1. no field submitted twice (`rejectDuplicateFields`)
2. the field exists on this item (`InventoryItemFieldRepository.findByIdAndInventoryItem`)
3. per type: radio group and color picker need exactly 1 option, a submitted checklist needs at least 1
4. every option id belongs to that field (query result size must equal the number of ids sent)
5. every radio group and color picker on the item was answered; checklists are optional
   (`requireMandatoryFields`, mirrors `isFieldRequired` on the frontend)

### Same product, different configurations
`CartItem.configurationKey` is a canonical string of the selections, e.g. `7:[5];8:[12, 13]`
(sorted, so the order things were sent in doesn't matter; `""` for items without options).
- the unique constraint is `(cart_id, item_id, configuration_key)`
- adding an identical configuration again adds to that row's quantity
- a different configuration creates a new row
- the key is copied onto `OrderItem`, which has the matching `(orders_id, item_id, configuration_key)` constraint

On the frontend, `AddToCartButton` shows "Customize" (opens the product modal) for configurable items on
the product grid, and "See in cart" only for items without options.

### Pricing: one unit, one formula
- `InventoryItem.itemCost` and every option `price` are in **dollars**. Don't mix in cents.
- `CartItem.getUnitPrice()` = item cost + every selected option (dollars). Stripe, the order and the cart
  drawer all use it. Jackson exposes it in the cart JSON as `unitPrice`.
- converted to cents in exactly two places: Stripe `unit_amount` and `OrderItem.unitPrice`, both
  `cartItem.getUnitPrice() * DOLLAR`
- careful: `CartItem.unitPrice` (frontend) is dollars, `OrderItem.unitPrice` is cents
- cart prices are a snapshot from add-to-cart time, they are not re-checked against inventory at checkout

### Stripe checkout page
`StripeCatalogService.mapCartItemstoLineItems`:
- items without options: `price_data.product` = the item's Stripe product, same as before
- configured items: `price_data.product_data` with name = item title, description = the selected options,
  the first image, and metadata `stripeProductId` + `configurationKey`. Stripe only shows a linked product's
  own name/description, so this is the only way to get the options onto the checkout page.
  Side effect: in the Stripe dashboard these sales show as one-off products, not under the item's product.

### Showing the selected options
Rendered as one line, e.g. `Color: Red · Add-ons: Keyring`:
- cart drawer, order status page, order items dialog: `describeConfiguration` in `frontend/lib/field-selections.ts`
- Stripe description: `CartItem.describeConfiguration()` / `CartItemField.describe()`
- confirmation email: `ResendService.describeConfiguration` (HTML escaped)
If you change the format, change all three.

### Gotchas hit during this refactor
- `OrderItemField.getOptions()` had `@Transient` imported from `java.beans` instead of `jakarta.persistence`.
  Jackson treats `java.beans.Transient` as "don't serialize", so order options vanished from the JSON and the
  order status page crashed. Always use `jakarta.persistence.Transient` on entities.
- `ddl-auto=update` adds columns and constraints but never drops them. The old `(cart_id, item_id)` and
  `(orders_id, item_id)` constraints had to be dropped by hand (see the migration section above).
- the `CartItemField*Repository` classes are unused: cart fields are saved through the cascade from `CartItem`.
