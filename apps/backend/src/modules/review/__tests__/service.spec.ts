import { moduleIntegrationTestRunner } from "@medusajs/test-utils"
import { REVIEW_MODULE } from "../index"
import ReviewModuleService from "../service"

moduleIntegrationTestRunner<ReviewModuleService>({
  moduleName: REVIEW_MODULE,
  resolve: "./src/modules/review",
  testSuite: ({ service }) => {
    describe("ReviewModuleService", () => {
      it("creates a review and retrieves it by id", async () => {
        const created = await service.createReviews({
          product_id: "prod_1",
          author_name: "Ana",
          rating: 5,
          comment: "Excelente calidad y acabado.",
        })

        const retrieved = await service.retrieveReview(created.id)

        expect(retrieved.product_id).toBe("prod_1")
        expect(retrieved.author_name).toBe("Ana")
        expect(retrieved.rating).toBe(5)
      })

      it("lists only the reviews belonging to a given product", async () => {
        await service.createReviews([
          { product_id: "prod_2", author_name: "Luis", rating: 4, comment: "Muy bueno" },
          { product_id: "prod_2", author_name: "Marta", rating: 3, comment: "Cumple" },
          { product_id: "prod_3", author_name: "Otro", rating: 5, comment: "Sin relacion" },
        ])

        const reviews = await service.listReviews({ product_id: "prod_2" })

        expect(reviews).toHaveLength(2)
        expect(reviews.every((r) => r.product_id === "prod_2")).toBe(true)
      })

      it("deletes a review", async () => {
        const created = await service.createReviews({
          product_id: "prod_4",
          author_name: "Sofia",
          rating: 2,
          comment: "No cumplio mis expectativas",
        })

        await service.deleteReviews(created.id)

        await expect(service.retrieveReview(created.id)).rejects.toThrow()
      })
    })
  },
})
