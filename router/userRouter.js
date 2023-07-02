const express = require("express")
const router = express.Router()
const pool = require("../db/pool")

router.post("/login", (req, res) => {
  const { username, password } = req.body
  if (username === "this") {
    // Redirect to the dashboar d page
    res.redirect("/home")
  } else {
    // Handle unsuccessful login
    const errorMessage = "Incorrect password"
    res.render("login", { errorMessage })
  }
})

router.get("/users", (req, res) => {
  db.all(`SELECT * FROM users`, (err, rows) => {
    if (err) {
      console.error("Error retrieving users:", err.message)
      res.status(400).send("Error retrieving users")
    } else {
      res.render("users", { users: rows })
    }
  })
})
module.exports = router
