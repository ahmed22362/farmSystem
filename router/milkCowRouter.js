const express = require("express")
const { db, closeDB, openDB } = require("../db/farmDB")
const router = express.Router()
const milkCowController = require("./../controller/milkCowController")

// weight
router
  .route("/weight/add")
  .get((req, res) => {
    res.render("MilkDailyInformation", { weight: true, route: "weight" })
  })
  .post(milkCowController.addWeigh)
router.route("/weight/details").get(milkCowController.getWeights)
router
  .route("/weight/update")
  .get(milkCowController.getUpdateWeight)
  .post(milkCowController.updateWeight)
router.post("/weight/delete", milkCowController.deleteWeight)

//fodder
router
  .route("/fodder/add")
  .get((req, res) => {
    res.render("MilkDailyInformation", { fodder: true, route: "fodder" })
  })
  .post(milkCowController.addFodder)
router.route("/fodder/details").get(milkCowController.getFodders)

router
  .route("/fodder/update")
  .get(milkCowController.getUpdateFodders)
  .post(milkCowController.updateFodder)
router.post("/fodder/delete", milkCowController.deleteFodder)

// milking
router
  .route("/milking/add")
  .get((req, res) => {
    res.render("MilkDailyInformation", { milking: true, route: "milking" })
  })
  .post(milkCowController.addMilking)
router.route("/milking/details").get(milkCowController.getMilking)
router
  .route("/milking/update")
  .get(milkCowController.getUpdateMilking)
  .post(milkCowController.updateMilking)
router.post("/milking/delete", milkCowController.deleteMilking)

//reproduction
router
  .route("/reproduction/add")
  .get((req, res) => {
    res.render("MilkDailyInformation", {
      reproduction: true,
      route: "reproduction",
    })
  })
  .post(milkCowController.addReproduction)
router.route("/reproduction/details").get(milkCowController.getReproductions)

router
  .route("/reproduction/update")
  .get(milkCowController.getUpdateReproductions)
  .post(milkCowController.updateReproduction)
router.post("/reproduction/delete", milkCowController.deleteReproduction)

// cow
router.route("/details/:id").get(milkCowController.getCowDetails)

router
  .route("/add")
  .get((req, res) => {
    res.render("addCow", { milkCow: true })
  })
  .post(milkCowController.addMilkCow)
router
  .route("/update")
  .get(milkCowController.getUpdateMilkCow)
  .post(milkCowController.UpdateMilkCow)

router.post("/delete", milkCowController.deleteMilkCow)
router.route("/details/:id").get(milkCowController.getCowDetails)
router.route("/").get(milkCowController.getAllMilkCow)

module.exports = router
