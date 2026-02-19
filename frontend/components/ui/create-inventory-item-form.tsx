"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Category, Badge } from "@/lib/types"
import { ImageDropField } from "./drag-drop"

const formSchema = z.object({
  itemTitle: z.string().min(1, "Item title is required"),
  item: z.string().min(1, "Item description is required"),
  itemCost: z.coerce.number().positive("Item cost must be positive"),
  image: z.array(z.instanceof(File)).min(1, "Image is required"),
  stripeId: z.string().min(1, "Stripe ID is required"),
  sale: z.boolean(),
  category: z.nativeEnum(Category),
  badge: z.nativeEnum(Badge),
})

type FormValues = z.infer<typeof formSchema>

export function CreateInventoryItemForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemTitle: "",
      item: "",
      itemCost: 0,
      image: [],
      stripeId: "",
      sale: false,
      category: Category.ELECTRONICS,
      badge: Badge.NEW,
    },
  })

  function onSubmit(data: FormValues) {
    // TODO: Upload images, then POST to /server/inventoryitem
    console.log(data)
    toast.success("Inventory item created")
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="border-b">
        <CardTitle>Create Inventory Item</CardTitle>
        <CardDescription>
          Add a new item to your inventory.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="create-inventory-item-form" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-6">
            {/* Left column - Input fields */}
            <FieldGroup>
              <Controller
                name="itemTitle"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="itemTitle">Item Title</FieldLabel>
                    <Input
                      id="itemTitle"
                      placeholder="Enter item title"
                      {...field}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="item"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="item">Item Description</FieldLabel>
                    <Input
                      id="item"
                      placeholder="Enter item description"
                      {...field}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="itemCost"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="itemCost">Item Cost</FieldLabel>
                    <Input
                      id="itemCost"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="image"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Image</FieldLabel>
                    <ImageDropField
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      required
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="stripeId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="stripeId">Stripe ID</FieldLabel>
                    <Input
                      id="stripeId"
                      placeholder="Enter Stripe product ID"
                      {...field}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="sale"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                    <FieldContent>
                      <FieldLabel htmlFor="sale">On Sale</FieldLabel>
                      <FieldDescription>
                        Mark this item as currently on sale
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      id="sale"
                      name={field.name}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            {/* Right column - Radio groups */}
            <FieldGroup>
              <Controller
                name="category"
                control={form.control}
                render={({ field, fieldState }) => {
                  const isInvalid = fieldState.invalid
                  return (
                    <FieldSet data-invalid={isInvalid}>
                      <FieldLegend variant="label">Category</FieldLegend>
                      <FieldDescription>
                        Select the item category.
                      </FieldDescription>
                      <RadioGroup
                        name={field.name}
                        value={field.value}
                        onValueChange={field.onChange}
                        aria-invalid={isInvalid}
                      >
                        <FieldLabel htmlFor="category-electronics">
                          <Field orientation="horizontal">
                            <FieldContent>
                              <FieldTitle>Electronics</FieldTitle>
                              <FieldDescription>
                                Electronic devices and accessories
                              </FieldDescription>
                            </FieldContent>
                            <RadioGroupItem
                              value={Category.ELECTRONICS}
                              id="category-electronics"
                            />
                          </Field>
                        </FieldLabel>
                        <FieldLabel htmlFor="category-prints">
                          <Field orientation="horizontal">
                            <FieldContent>
                              <FieldTitle>Prints</FieldTitle>
                              <FieldDescription>
                                Printed materials and artwork
                              </FieldDescription>
                            </FieldContent>
                            <RadioGroupItem
                              value={Category.PRINTS}
                              id="category-prints"
                            />
                          </Field>
                        </FieldLabel>
                        <FieldLabel htmlFor="category-custom">
                          <Field orientation="horizontal">
                            <FieldContent>
                              <FieldTitle>Custom</FieldTitle>
                              <FieldDescription>
                                Custom made items
                              </FieldDescription>
                            </FieldContent>
                            <RadioGroupItem
                              value={Category.CUSTOM}
                              id="category-custom"
                            />
                          </Field>
                        </FieldLabel>
                      </RadioGroup>
                      {isInvalid && <FieldError errors={[fieldState.error]} />}
                    </FieldSet>
                  )
                }}
              />
              <Controller
                name="badge"
                control={form.control}
                render={({ field, fieldState }) => {
                  const isInvalid = fieldState.invalid
                  return (
                    <FieldSet data-invalid={isInvalid}>
                      <FieldLegend variant="label">Badge</FieldLegend>
                      <FieldDescription>
                        Select a badge for this item.
                      </FieldDescription>
                      <RadioGroup
                        name={field.name}
                        value={field.value}
                        onValueChange={field.onChange}
                        aria-invalid={isInvalid}
                      >
                        <FieldLabel htmlFor="badge-bestseller">
                          <Field orientation="horizontal">
                            <FieldContent>
                              <FieldTitle>Bestseller</FieldTitle>
                              <FieldDescription>
                                Mark as a top selling item
                              </FieldDescription>
                            </FieldContent>
                            <RadioGroupItem
                              value={Badge.BESTSELLER}
                              id="badge-bestseller"
                            />
                          </Field>
                        </FieldLabel>
                        <FieldLabel htmlFor="badge-new">
                          <Field orientation="horizontal">
                            <FieldContent>
                              <FieldTitle>New</FieldTitle>
                              <FieldDescription>
                                Recently added item
                              </FieldDescription>
                            </FieldContent>
                            <RadioGroupItem
                              value={Badge.NEW}
                              id="badge-new"
                            />
                          </Field>
                        </FieldLabel>
                        <FieldLabel htmlFor="badge-sale">
                          <Field orientation="horizontal">
                            <FieldContent>
                              <FieldTitle>Sale</FieldTitle>
                              <FieldDescription>
                                Item is on sale
                              </FieldDescription>
                            </FieldContent>
                            <RadioGroupItem
                              value={Badge.SALE}
                              id="badge-sale"
                            />
                          </Field>
                        </FieldLabel>
                      </RadioGroup>
                      {isInvalid && <FieldError errors={[fieldState.error]} />}
                    </FieldSet>
                  )
                }}
              />
            </FieldGroup>
          </div>
        </form>
      </CardContent>
      <CardFooter className="border-t">
        <Field>
          <Button type="submit" form="create-inventory-item-form">
            Create Item
          </Button>
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
