import { describe, expect, it } from "vitest"
import {
  getProduct3DModel,
  getProductColors,
  getProductMaterials,
  getProductPriceRange,
  getVariantAvailableQuantity,
  variantMatchesSelection,
  type MedusaProduct,
  type MedusaProductOption,
  type MedusaVariant,
} from "./medusa"

function makeProduct(overrides: Partial<MedusaProduct> = {}): MedusaProduct {
  return {
    id: "prod_1",
    title: "Reloj de lujo",
    handle: "reloj-de-lujo",
    description: null,
    thumbnail: null,
    status: "published",
    created_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as MedusaProduct
}

describe("getProductPriceRange", () => {
  it("returns zero and mxn when there are no priced variants", () => {
    expect(getProductPriceRange(makeProduct({ variants: [] }))).toEqual({
      min: 0,
      max: 0,
      currency: "mxn",
    })
  })

  it("computes min/max across variants and takes the currency from the first priced one", () => {
    const product = makeProduct({
      variants: [
        { id: "v1", title: "A", sku: null, calculated_price: { calculated_amount: 500, currency_code: "mxn" } },
        { id: "v2", title: "B", sku: null, calculated_price: { calculated_amount: 300, currency_code: "mxn" } },
        { id: "v3", title: "C", sku: null },
      ] as MedusaVariant[],
    })

    expect(getProductPriceRange(product)).toEqual({ min: 300, max: 500, currency: "mxn" })
  })
})

describe("getProductColors / getProductMaterials", () => {
  it("reads values from the option literally titled 'color'", () => {
    const product = makeProduct({
      options: [
        { id: "opt_color", title: "Color", values: [{ value: "Negro" }, { value: "Camel" }] },
        { id: "opt_size", title: "Tamano", values: [{ value: "38mm" }] },
      ] as MedusaProductOption[],
    })

    expect(getProductColors(product)).toEqual(["Negro", "Camel"])
  })

  it("recognizes both 'material' and 'metal' as the material option", () => {
    const withMaterial = makeProduct({
      options: [{ id: "opt_1", title: "Material", values: [{ value: "Acero" }] }] as MedusaProductOption[],
    })
    const withMetal = makeProduct({
      options: [{ id: "opt_1", title: "Metal", values: [{ value: "Oro" }] }] as MedusaProductOption[],
    })

    expect(getProductMaterials(withMaterial)).toEqual(["Acero"])
    expect(getProductMaterials(withMetal)).toEqual(["Oro"])
  })

  it("returns an empty array when there is no matching option", () => {
    expect(getProductColors(makeProduct({ options: [] }))).toEqual([])
  })
})

describe("variantMatchesSelection", () => {
  // Regression test: variant.options is `{ option_id, value }[]`, not a flat
  // `Record<optionTitle, value>` — matching by title/value alone previously
  // let a variant match the wrong option group when two options shared a value.
  const productOptions: MedusaProductOption[] = [
    { id: "opt_color", title: "Color" },
    { id: "opt_size", title: "Tamano" },
  ]

  const variant: MedusaVariant = {
    id: "v1",
    title: "Negro / 38mm",
    sku: "SKU-1",
    options: [
      { option_id: "opt_color", value: "Negro" },
      { option_id: "opt_size", value: "38mm" },
    ],
  }

  it("matches when every option's selected value corresponds to that option's id", () => {
    expect(
      variantMatchesSelection(variant, productOptions, { Color: "Negro", Tamano: "38mm" })
    ).toBe(true)
  })

  it("does not match when a value is right but tied to the wrong option", () => {
    expect(
      variantMatchesSelection(variant, productOptions, { Color: "38mm", Tamano: "Negro" })
    ).toBe(false)
  })

  it("does not match on a partial selection", () => {
    expect(variantMatchesSelection(variant, productOptions, { Color: "Negro" })).toBe(false)
  })
})

describe("getVariantAvailableQuantity", () => {
  it("sums available quantity across all inventory items and location levels", () => {
    const variant: MedusaVariant = {
      id: "v1",
      title: "A",
      sku: null,
      inventory_items: [
        { inventory: { location_levels: [{ available_quantity: 3 }, { available_quantity: 2 }] } },
        { inventory: { location_levels: [{ available_quantity: 5 }] } },
      ],
    }

    expect(getVariantAvailableQuantity(variant)).toBe(10)
  })

  it("returns 0 when there is no inventory data", () => {
    expect(getVariantAvailableQuantity({ id: "v1", title: "A", sku: null })).toBe(0)
  })
})

describe("getProduct3DModel", () => {
  it("returns the model url when metadata.model3d is a string", () => {
    expect(getProduct3DModel(makeProduct({ metadata: { model3d: "/models/x.glb" } }))).toBe(
      "/models/x.glb"
    )
  })

  it("returns null when metadata is missing or model3d isn't a string", () => {
    expect(getProduct3DModel(makeProduct())).toBeNull()
    expect(getProduct3DModel(makeProduct({ metadata: { model3d: 123 } }))).toBeNull()
  })
})
