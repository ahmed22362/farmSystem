const express = require("express")
const router = express.Router()

router.route("/").get(function (req, res) {
  res.render("home")
})

router.route("/addMeatCow").get((req, res) => {
  res.render("addMeatCow")
})

router.post("/delete", (req, res) => {
  var requestedBookName = req.body.bookName
  var j = 0
  books.forEach((book) => {
    j = j + 1
    if (book.bookName == requestedBookName) {
      books.splice(j - 1, 1)
    }
  })
  res.render("home", {
    data: books,
  })
})

module.exports = router
