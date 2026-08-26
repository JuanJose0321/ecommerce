import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { REVIEW_MODULE } from "../modules/review"
import type ReviewModuleService from "../modules/review/service"

type CreateReviewInput = {
  product_id: string
  author_name: string
  rating: number
  comment: string
}

const createReviewStep = createStep(
  "create-review",
  async (input: CreateReviewInput, { container }) => {
    const reviewModuleService: ReviewModuleService = container.resolve(REVIEW_MODULE)
    const review = await reviewModuleService.createReviews(input)
    return new StepResponse(review, review.id)
  },
  async (reviewId: string | undefined, { container }) => {
    if (!reviewId) return
    const reviewModuleService: ReviewModuleService = container.resolve(REVIEW_MODULE)
    await reviewModuleService.deleteReviews(reviewId)
  }
)

export const createReviewWorkflow = createWorkflow(
  "create-review",
  (input: CreateReviewInput) => {
    const review = createReviewStep(input)
    return new WorkflowResponse(review)
  }
)
