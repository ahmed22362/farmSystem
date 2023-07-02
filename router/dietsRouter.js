const dietController = require("../controller/dietController")
const express = require("express")
const router = express.Router()

router
  .route("/fattening_fodder")
  .get((req, res) => {
    res.render("dietAddCowDet", {
      fattening: true,
      endpoint: "fattening_fodder",
    })
  })
  .post(dietController.getFodderInfo)
router
  .route("/fattening_fodder/ingredient")
  .get(dietController.getFodderIngredientRouter)
  .post(dietController.getFodderIngredient)

// milking

router
  .route("/milking_fodder")
  .get((req, res) => {
    res.render("dietAddCowDet", {
      milking: true,
      endpoint: "milking_fodder",
    })
  })
  .post(dietController.getMilkingInfo)
router
  .route("/milking_fodder/ingredient")
  .get(dietController.getMilkingIngredientRouter)
  .post(dietController.getMilkingFodderIngredient)

router.get("/", (req, res) => {
  res.render("dietHomePage")
})

module.exports = router
