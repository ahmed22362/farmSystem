const { closeDB, openDB } = require("../db/farmDB")

exports.getCowDetails = (req, res) => {
  // Fetch the meat cow data from the database
  const meatCowId = req.params.id // Assuming you pass the ID as a query parameter
  openDB().then((openDB) => {
    openDB.get(
      `SELECT *
        FROM weight_tracking
        WHERE cow_id = ${meatCowId}
        ORDER BY measurement_date DESC
        LIMIT 1`,
      (err, weightRow) => {
        openDB.get(
          "SELECT * FROM cow WHERE id = ?",
          [meatCowId],
          (err, row) => {
            if (err) {
              console.error("Error retrieving meat cow:", err.message)
              closeDB()
              return res.status(400).send(err.message)
            } else {
              closeDB()
              if (weightRow) {
                row.weight = weightRow.weight
              }
              res.render("detailsCow", { animal: row, meatCow: true })
            }
          }
        )
      }
    )
  })
}

exports.addMeatCow = (req, res) => {
  req.body.type = "meat"
  const columns = Object.keys(req.body).join(", ")
  const values = Object.values(req.body)
    .map((value) => `"${value}"`)
    .join(", ")

  // Insert the form data into the meat_cow table
  const sql = `INSERT INTO cow (${columns}) 
                VALUES (${values})`
  openDB().then((openDB) =>
    openDB.run(sql, (err) => {
      if (err) {
        console.log(err.message)
        return res.status(400).end(`some thing wrrong happened: ${err.message}`)
      } else {
        res.redirect("/meat_cows")
      }
    })
  )
}

exports.getAllMeatCow = (req, res) => {
  openDB().then((openDB) =>
    openDB.all(`SELECT * FROM cow WHERE type = "meat"`, [], (err, rows) => {
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
}

exports.deleteMeatCow = (req, res) => {
  const sql = `DELETE FROM cow WHERE id = ${req.body.id}`
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
}

exports.updateMeatCow = (req, res) => {
  const meatCowId = req.body.id
  const columns =
    Object.keys(req.body)
      .filter((key) => key !== "id")
      .join(" = ?, ") + " = ?"
  const values = Object.values(req.body).filter((value, index) => index !== 0)

  const sql = `UPDATE cow SET ${columns} WHERE id = ?`
  openDB().then((openDB) =>
    openDB.run(sql, [...values, meatCowId], function (err) {
      if (err) {
        console.error(err.message)
        return res.sendStatus(400).end(err.message)
      }
      console.log(`Updated meat_cow with id ${meatCowId}`)
      res.redirect("/meat_cows") // Redirect to the meat_cows page after updating
    })
  )
}

exports.getUpdateMeatCow = (req, res) => {
  // Fetch the meat cow data from the database
  const meatCowId = req.query.id // Assuming you pass the ID as a query parameter
  openDB().then((openDB) =>
    openDB.get("SELECT * FROM cow WHERE id = ?", [meatCowId], (err, row) => {
      if (err) {
        console.error("Error retrieving meat cow:", err.message)
        closeDB()
        return res.status(400).send(err.message)
      } else {
        closeDB()
        res.render("updateCow", { animal: row, meatCow: true })
      }
    })
  )
}

// CRUD operations for weight_record table
exports.addWeigh = (req, res) => {
  const { cow_id, weight, measurement_date } = req.body
  // Check if the cow exists
  const checkCowSql = `SELECT id FROM cow WHERE id = ${cow_id} and type ="meat"`
  openDB().then((db) => {
    db.get(checkCowSql, (err, row) => {
      if (err) {
        console.error(err.message)
        return res.status(400).send(err.message)
      }
      if (!row) {
        // Cow does not exist
        return res.status(404).send("<h1>Cow not found</h1>")
      }
      // Cow exists, insert the weight record
      const insertSql = `INSERT INTO weight_tracking (cow_id, weight, measurement_date) VALUES (?, ?, ?)`
      db.run(insertSql, [cow_id, weight, measurement_date], function (err) {
        if (err) {
          console.error(err.message)
          return res.status(400).send(err.message)
        }
        console.log(`Added weight record with id ${this.lastID}`)
        res.redirect("/meat_cows")
      })
    })
  })
}

exports.getWeights = (req, res) => {
  const cowId = req.query.id
  const sql = `SELECT * FROM weight_tracking WHERE cow_id = ?`
  openDB().then((db) => {
    db.all(sql, [cowId], (err, rows) => {
      if (err) {
        console.error(err.message)
        return res.status(400).send(err.message)
      }
      closeDB()
      res.render("dailyDashboard", {
        records: rows,
        meatCow: true,
        weight: true,
        first: "meat_cows",
        second: "weight",
      })
    })
  })
}

exports.deleteWeight = (req, res) => {
  const { id, cow_id } = req.body
  const sql = `DELETE FROM weight_tracking WHERE id = ?`
  openDB().then((db) => {
    db.run(sql, [id], function (err) {
      if (err) {
        console.error(err.message)
        return res.status(400).send(err.message)
      }
      console.log(`Deleted weight record with id ${id}`)
      res.redirect(`/meat_cows/weight/details?id=${cow_id}`)
    })
  })
}
exports.getUpdateWeight = (req, res) => {
  // Fetch the meat cow data from the database
  const weightRecordID = req.query.id // Assuming you pass the ID as a query parameter
  openDB().then((openDB) =>
    openDB.get(
      "SELECT * FROM weight_tracking WHERE id = ?",
      [weightRecordID],
      (err, row) => {
        if (err) {
          console.error("Error retrieving meat cow:", err.message)
          closeDB()
          return res.status(400).send(err.message)
        } else {
          closeDB()
          res.render("updateDailyInformation", {
            record: row,
            meatCow: true,
            weight: true,
            first: "meat_cows",
            second: "weight",
          })
        }
      }
    )
  )
}
exports.updateWeight = (req, res) => {
  const { weight, measurement_date, id, cow_id } = req.body
  // Weight record exists, update the data
  const updateSql = `UPDATE weight_tracking SET weight = ?, measurement_date = ? WHERE id = ?`
  openDB().then((openDB) =>
    openDB.run(updateSql, [weight, measurement_date, id], function (err) {
      if (err) {
        console.error(err.message)
        return res.status(400).send(err.message)
      }
      console.log(`Updated weight record with id ${id}`)
      res.redirect(`/meat_cows/weight/details?id=${cow_id}`)
    })
  )
}

// CRUD operations for fodder_tracking table
exports.addFodder = (req, res) => {
  const { cow_id, fodder_amount, feeding_date } = req.body
  // Check if the cow exists
  const checkCowSql = `SELECT id FROM cow WHERE id = ${cow_id} and type ="meat"`
  openDB().then((db) => {
    db.get(checkCowSql, (err, row) => {
      if (err) {
        console.error(err.message)
        return res.status(400).send(err.message)
      }
      if (!row) {
        // Cow does not exist
        return res.status(404).send("<h1>Cow not found</h1>")
      }
      // Cow exists, insert the fodder record
      const insertSql = `INSERT INTO fodder_tracking (cow_id, fodder_amount, feeding_date) VALUES (?, ?, ?)`
      db.run(insertSql, [cow_id, fodder_amount, feeding_date], function (err) {
        if (err) {
          console.error(err.message)
          return res.status(400).send(err.message)
        }
        console.log(`Added fodder record with id ${this.lastID}`)
        res.redirect("/meat_cows")
      })
    })
  })
}
exports.getFodders = (req, res) => {
  const cowId = req.query.id
  const sql = `SELECT * FROM fodder_tracking WHERE cow_id = ?`
  openDB().then((db) => {
    db.all(sql, [cowId], (err, rows) => {
      if (err) {
        console.error(err.message)
        return res.status(400).send(err.message)
      }
      closeDB()
      res.render("dailyDashboard", {
        records: rows,
        meatCow: true,
        fodder: true,
        first: "meat_cows",
        second: "fodder",
      })
    })
  })
}
exports.getUpdateFodders = (req, res) => {
  // Fetch the meat cow data from the database
  const weightRecordID = req.query.id // Assuming you pass the ID as a query parameter
  openDB().then((openDB) =>
    openDB.get(
      "SELECT * FROM fodder_tracking WHERE id = ?",
      [weightRecordID],
      (err, row) => {
        if (err) {
          console.error("Error retrieving meat cow:", err.message)
          closeDB()
          return res.status(400).send(err.message)
        } else {
          closeDB()
          res.render("updateDailyInformation", {
            record: row,
            meatCow: true,
            fodder: true,
            first: "meat_cows",
            second: "fodder",
          })
        }
      }
    )
  )
}
exports.updateFodder = (req, res) => {
  const { fodder_amount, feeding_date, id, cow_id } = req.body
  // Weight record exists, update the data
  const updateSql = `UPDATE fodder_tracking SET fodder_amount = ?, feeding_date = ? WHERE id = ?`
  openDB().then((openDB) =>
    openDB.run(updateSql, [fodder_amount, feeding_date, id], function (err) {
      if (err) {
        console.error(err.message)
        return res.status(400).send(err.message)
      }
      console.log(`Updated weight record with id ${id}`)
      res.redirect(`/meat_cows/fodder/details?id=${cow_id}`)
    })
  )
}
exports.deleteFodder = (req, res) => {
  const { id, cow_id } = req.body
  console.log(req.body)
  const sql = `DELETE FROM fodder_tracking WHERE id = ?`
  openDB().then((db) => {
    db.run(sql, [id], function (err) {
      if (err) {
        console.error(err.message)
        return res.status(400).send(err.message)
      }
      console.log(`Deleted weight record with id ${id}`)
      res.redirect(`/meat_cows/fodder/details?id=${cow_id}`)
    })
  })
}
