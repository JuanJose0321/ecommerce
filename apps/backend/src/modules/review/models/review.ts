import { model } from "@medusajs/framework/utils"

const Review = model.define("review", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  author_name: model.text(),
  rating: model.number(),
  comment: model.text(),
})

export default Review
