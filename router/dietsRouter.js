const express = require("express")
const router = express.Router()

router.get("/", (req, res) => {
  const options = [
    { id: "option1", value: "option1", label: "Option 1", color: "#ff0000" },
    { id: "option2", value: "option2", label: "Option 2", color: "#00ff00" },
    { id: "option3", value: "option3", label: "Option 3", color: "#0000ff" },
  ]

  // Get the selected options (in this example, option1 and option3 are selected)
  const selectedOptions = ["option1", "option3"]

  // Render the checkboxes.ejs template with the options and selected options
  res.render("dietPage", { options, selectedOptions })
})
module.exports = router
