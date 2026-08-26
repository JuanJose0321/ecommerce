import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { Modules } from "@medusajs/framework/utils"

jest.setTimeout(60_000)

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("Store reviews API", () => {
      let publishableKey: string

      beforeAll(async () => {
        const apiKeyModuleService = getContainer().resolve(Modules.API_KEY)
        const apiKey = await apiKeyModuleService.createApiKeys({
          title: "test-publishable-key",
          type: "publishable",
          created_by: "",
        })
        publishableKey = apiKey.token
      }, 60_000)

      it("creates a review via POST and lists it via GET", async () => {
        const productId = "prod_test_1"

        const createRes = await api.post(
          `/store/products/${productId}/reviews`,
          { author_name: "Camila", rating: 5, comment: "Hermosa pieza, llego perfecta." },
          { headers: { "x-publishable-api-key": publishableKey } }
        )

        expect(createRes.status).toBe(201)
        expect(createRes.data.review.product_id).toBe(productId)

        const listRes = await api.get(`/store/products/${productId}/reviews`, {
          headers: { "x-publishable-api-key": publishableKey },
        })

        expect(listRes.status).toBe(200)
        expect(listRes.data.count).toBe(1)
        expect(listRes.data.average).toBe(5)
        expect(listRes.data.reviews[0].author_name).toBe("Camila")
      })

      it("rejects an invalid review payload with 400", async () => {
        await expect(
          api.post(
            `/store/products/prod_test_2/reviews`,
            { author_name: "", rating: 6, comment: "" },
            { headers: { "x-publishable-api-key": publishableKey } }
          )
        ).rejects.toMatchObject({ response: { status: 400 } })
      })

      it("rejects requests without a publishable key", async () => {
        await expect(api.get(`/store/products/prod_test_1/reviews`)).rejects.toMatchObject({
          response: { status: expect.any(Number) },
        })
      })
    })
  },
})
