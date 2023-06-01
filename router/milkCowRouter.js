const express = require("express")
const { db, closeDB, openDB } = require("../db/farmDB")
const router = express.Router()

router.get("/add", (req, res) => {
  res.render("addCow", { milkCow: true })
})
router
  .route("/update")
  .get((req, res) => {
    // Fetch the meat cow data from the database
    const milkCowId = req.query.id // Assuming you pass the ID as a query parameter
    openDB().then((openDB) =>
      openDB.get(
        "SELECT * FROM milk_cow WHERE id = ?",
        [milkCowId],
        (err, row) => {
          if (err) {
            console.error("Error retrieving meat cow:", err.message)
            closeDB()
            return res.status(400).send(err.message)
          } else {
            closeDB()
            res.render("updateCow", { animal: row, milkCow: true })
          }
        }
      )
    )
  })
  .post((req, res) => {
    const milkCowId = req.body.id
    const columns =
      Object.keys(req.body)
        .filter((key) => key !== "id")
        .join(" = ?, ") + " = ?"
    const values = Object.values(req.body).filter((value, index) => index !== 0)

    const sql = `UPDATE milk_cow SET ${columns} WHERE id = ?`
    openDB().then((openDB) =>
      openDB.run(sql, [...values, milkCowId], function (err) {
        if (err) {
          console.error(err.message)
          return res.sendStatus(400).end(err.message)
        }
        console.log(`Updated milk_cow with id ${milkCowId}`)
        res.redirect("/milk_cows") // Redirect to the milk_cows page after updating
      })
    )
  })
router.post("/delete", (req, res) => {
  const milkCowId = req.body.id
  const sql = `DELETE FROM milk_cow WHERE id = ${req.body.id}`
  openDB().then((openDB) => {
    openDB.run(sql, function (err) {
      if (err) {
        console.error(err.message)
        return res.sendStatus(400).end(err.message)
      }
      console.log(`Deleted milk_cow with id ${req.body.id}`)
      res.redirect("/milk_cows")
    })
  })
})
router.route("/details/:id").get((req, res) => {
  {
    // Fetch the meat cow data from the database
    const milkCowId = req.params.id // Assuming you pass the ID as a query parameter
    openDB().then((openDB) => {
      openDB.get(
        "SELECT * FROM milk_cow WHERE id = ?",
        [milkCowId],
        (err, row) => {
          if (err) {
            console.error("Error retrieving meat cow:", err.message)
            closeDB()
            return res.status(400).send(err.message)
          } else {
            closeDB()
            res.render("detailsCow", { animal: row, milkCow: true })
          }
        }
      )
    })
  }
})
router
  .route("/")
  .get((req, res) => {
    openDB().then((openDB) =>
      openDB.all(`SELECT * FROM milk_cow`, [], (err, rows) => {
        if (err) {
          console.log(err.message)
          closeDB()
          return res.status(400).send(err.message)
        } else {
          closeDB()
          res.render("dashCard", { data: rows, milkCow: true })
        }
      })
    )
  })
  .post((req, res) => {
    const columns = Object.keys(req.body).join(", ")
    const values = Object.values(req.body)
      .map((value) => `"${value}"`)
      .join(", ")

    // Insert the form data into the milk_cow table
    const sql = `INSERT INTO milk_cow (${columns}) 
                VALUES (${values})`

    openDB().then((openDB) =>
      openDB.run(sql, (err) => {
        if (err) {
          console.log(err.message)
          return res
            .status(400)
            .end(`some thing wrrong happened: ${err.message}`)
        } else {
          res.redirect("milk_cows")
        }
      })
    )
  })

module.exports = router
