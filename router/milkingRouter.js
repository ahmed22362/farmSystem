const express = require("express")
const router = express.Router()
const milkingCowsCount = 10
const milkingLitersAmount = 500
const averageMilkingTime = 5
const highestMilkProduction = 20
const milkingRecords = ["Record 1", "Record 2", "Record 3"]
router.route("/").get((req, res) => {
  res.render("milkDashboard", {
    milkingCowsCount,
    milkingLitersAmount,
    averageMilkingTime,
    highestMilkProduction,
    milkingRecords,
  })
})
module.exports = router
