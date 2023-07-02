const express = require("express")
const milkingAnalysisController = require("./../controller/milkingAnalysisController")
const router = express.Router()

router.route("/").get(async (req, res) => {
  const count = await milkingAnalysisController.getCountOfMilkedCows()
  const milkCount = await milkingAnalysisController.getMilkingAmount()
  const highest = await milkingAnalysisController.getHighestMilkProduction()
  const records = await milkingAnalysisController.getAllMilkingRecords()

  const options = {
    day: "numeric",
    month: "long",
    year: "numeric",
    locale: "ar",
  }

  const label = JSON.stringify(
    records.map((obj) =>
      new Date(obj.milking_datetime).toLocaleDateString("ar", options)
    )
  )
  const data = JSON.stringify(records.map((obj) => obj.milk_amount))

  res.render("milkDashboard", {
    milkingCowsCount: count,
    milkingLitersAmount: milkCount,
    highestMilkProduction: highest.highestMilkProduction,
    maxMilkProductionCow: highest.cow_id,
    milkingRecords: records,
    label: label,
    data,
  })
})
module.exports = router
