const express = require("express")
const { closeDB, openDB } = require("../db/farmDB")
const pool = require("./../db/pool")
const router = express.Router()
const meatCowController = require("./../controller/meatCowController")

router
  .route("/weight/add")
  .get((req, res) => {
    res.render("MeatDailyInformation", { weight: true })
  })
  .post(meatCowController.addWeigh)
router.route("/weight/details").get(meatCowController.getWeights)
router
  .route("/weight/update")
  .get(meatCowController.getUpdateWeight)
  .post(meatCowController.updateWeight)
router.post("/weight/delete", meatCowController.deleteWeight)

router
  .route("/fodder/add")
  .get((req, res) => {
    res.render("MeatDailyInformation", { fodder: true })
  })
  .post(meatCowController.addFodder)
router.route("/fodder/details").get(meatCowController.getFodders)

router
  .route("/fodder/update")
  .get(meatCowController.getUpdateFodders)
  .post(meatCowController.updateFodder)
router.post("/fodder/delete", meatCowController.deleteFodder)

router
  .route("/add")
  .get((req, res) => {
    res.render("addCow", { meatCow: true })
  })
  .post(meatCowController.addMeatCow)

router.route("/details/:id").get(meatCowController.getCowDetails)
router
  .route("/update")
  .get(meatCowController.getUpdateMeatCow)
  .post(meatCowController.updateMeatCow)
router.post("/delete", meatCowController.deleteMeatCow)

router.route("/").get(meatCowController.getAllMeatCow)

module.exports = router
