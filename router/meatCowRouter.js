const express = require("express")
const { closeDB, openDB } = require("../db/farmDB")
const pool = require("./../db/pool")
const router = express.Router()

router.route("/details/:id").get((req, res) => {
  {
    // Fetch the meat cow data from the database
    const meatCowId = req.params.id // Assuming you pass the ID as a query parameter
    openDB().then((openDB) =>
      openDB.get(
        "SELECT * FROM meat_cow WHERE id = ?",
        [meatCowId],
        (err, row) => {
          if (err) {
            console.error("Error retrieving meat cow:", err.message)
            closeDB()
            return res.status(400).send(err.message)
          } else {
            closeDB()
            res.render("detailsCow", { animal: row, meatCow: true })
          }
        }
      )
    )
  }
})

router.get("/add", (req, res) => {
  res.render("addCow", { meatCow: true })
})
router
  .route("/update")
  .get((req, res) => {
    // Fetch the meat cow data from the database
    const meatCowId = req.query.id // Assuming you pass the ID as a query parameter
    openDB().then((openDB) =>
      openDB.get(
        "SELECT * FROM meat_cow WHERE id = ?",
        [meatCowId],
        (err, row) => {
          if (err) {
            console.error("Error retrieving meat cow:", err.message)
            closeDB()
            return res.status(400).send(err.message)
          } else {
            closeDB()
            console.log(row)
            res.render("updateCow", { animal: row, meatCow: true })
          }
        }
      )
    )
  })
  .post((req, res) => {
    const meatCowId = req.body.id
    const columns =
      Object.keys(req.body)
        .filter((key) => key !== "id")
        .join(" = ?, ") + " = ?"
    const values = Object.values(req.body).filter((value, index) => index !== 0)

    const sql = `UPDATE meat_cow SET ${columns} WHERE id = ?`
    openDB().then((openDB) =>
      openDB.run(sql, [...values, meatCowId], function (err) {
        console.log([...values])
        if (err) {
          console.error(err.message)
          return res.sendStatus(400).end(err.message)
        }
        console.log(`Updated meat_cow with id ${meatCowId}`)
        res.redirect("/meat_cows") // Redirect to the meat_cows page after updating
      })
    )
  })
router.post("/delete", (req, res) => {
  const meatCowId = req.body.id
  console.log(req.body.id, req.body)
  const sql = `DELETE FROM meat_cow WHERE id = ${req.body.id}`
  console.log(sql)
  openDB().then((openDB) => {
    openDB.run(sql, function (err) {
      if (err) {
        console.error(err.message)
        return res.sendStatus(400).end(err.message)
      }
      console.log(`Deleted meat_cow with id ${req.body.id}`)
      res.redirect("http://localhost:3000/meat_cows")
    })
  })
})

router
  .route("/")
  .get((req, res) => {
    console.log("here")
    openDB().then((openDB) =>
      openDB.all(`SELECT * FROM meat_cow`, [], (err, rows) => {
        if (err) {
          console.log(err.message)
          closeDB()
          return res.status(400).send(err.message)
        } else {
          closeDB()
          res.render("dashCard", { data: rows, meatCow: true })
        }
      })
    )
  })
  .post((req, res) => {
    console.log(req.body)
    const columns = Object.keys(req.body).join(", ")
    const values = Object.values(req.body)
      .map((value) => `"${value}"`)
      .join(", ")

    // Insert the form data into the meat_cow table
    const sql = `INSERT INTO meat_cow (${columns}) 
                VALUES (${values})`
    openDB().then((openDB) =>
      openDB.run(sql, (err) => {
        if (err) {
          console.log(err.message)
          return res
            .status(400)
            .end(`some thing wrrong happened: ${err.message}`)
        } else {
          res.redirect("meat_cows")
        }
      })
    )
  })

module.exports = router
