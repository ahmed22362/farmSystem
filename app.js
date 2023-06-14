const express = require("express")
const bodyParser = require("body-parser")
const path = require("path")
const open = require("openurl")
const { closeDB } = require("./db/farmDB")
const morgan = require("morgan")
const useRouter = require("./router/userRouter")
const meatCowRouter = require("./router/meatCowRouter")
const milkCowRouter = require("./router/milkCowRouter")
const milkingRouter = require("./router/milkingRouter")
const dietsRouter = require("./router/dietsRouter")

let user
// db.all(`SELECT * FROM users`, (err, rows) => {
//   if (err) {
//     console.error("Error retrieving users:", err.message)
//   } else {
//     user = rows
//   }
// })
const app = express()

app.use(express.static(path.join(__dirname, "/public")))
app.set("view engine", "ejs")
app.engine("ejs", require("ejs").__express)
app.use(morgan("dev"))

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.use("/home", function (req, res) {
  res.render("home")
})

app.use("/meat_cows", meatCowRouter)
app.use("/milk_cows", milkCowRouter)
app.use("/milking", milkingRouter)
app.use("/diets", dietsRouter)

app.use("/user", useRouter)

app.get("/", (req, res) => {
  res.render("login")
})

const server = app.listen(3000, (req, res) => {
  // open.open("http://localhost:3000/")
  console.log("App is running on port 3000")
})
server.on("close", () => {
  closeDB() // Assuming you have a closeDB() function to close the database
})
