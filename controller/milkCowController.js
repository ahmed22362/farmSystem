const { closeDB, openDB } = require("../db/farmDB")

exports.getUpdateMilkCow = (req, res) => {
  // Fetch the milk cow data from the database
  const milkCowId = req.query.id // Assuming you pass the ID as a query parameter
  openDB().then((openDB) =>
    openDB.get("SELECT * FROM cow WHERE id = ?", [milkCowId], (err, row) => {
      if (err) {
        console.error("Error retrieving milk cow:", err.message)
        closeDB()
        return res.status(400).send(err.message)
      } else {
        closeDB()
        res.render("updateCow", { animal: row, milkCow: true })
      }
    })
  )
}
exports.UpdateMilkCow = (req, res) => {
  const milkCowId = req.body.id
  const columns =
    Object.keys(req.body)
      .filter((key) => key !== "id")
      .join(" = ?, ") + " = ?"
  const values = Object.values(req.body).filter((value, index) => index !== 0)

  const sql = `UPDATE cow SET ${columns} WHERE id = ?`
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
}

exports.deleteMilkCow = (req, res) => {
  const milkCowId = req.body.id
  const sql = `DELETE FROM cow WHERE id = ${req.body.id}`
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
}

exports.getCowDetails = (req, res) => {
  {
    // Fetch the milk cow data from the database
    const milkCowId = req.params.id // Assuming you pass the ID as a query parameter
    openDB().then((openDB) => {
      openDB.get("SELECT * FROM cow WHERE id = ?", [milkCowId], (err, row) => {
        if (err) {
          console.error("Error retrieving milk cow:", err.message)
          closeDB()
          return res.status(400).send(err.message)
        } else {
          closeDB()
          res.render("detailsCow", { animal: row, milkCow: true })
        }
      })
    })
  }
}

exports.getAllMilkCow = (req, res) => {
  openDB().then((openDB) =>
    openDB.all(`SELECT * FROM cow where type = "milk"; `, [], (err, rows) => {
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
}

exports.addMilkCow = (req, res) => {
  req.body.type = "milk"
  req.body.gender = "female"
  const columns = Object.keys(req.body).join(", ")
  const values = Object.values(req.body)
    .map((value) => `"${value}"`)
    .join(", ")

  // Insert the form data into the milk_cow table
  const sql = `INSERT INTO cow (${columns}) 
                VALUES (${values})`

  openDB().then((openDB) =>
    openDB.run(sql, (err) => {
      if (err) {
        console.log(err.message)
        return res.status(400).end(`some thing wrrong happened: ${err.message}`)
      } else {
        res.redirect("/milk_cows")
      }
    })
  )
}

// CRUD operations for milking_record table
exports.addMilkingRecord = (req, res) => {
  const { cowId, date, quantity } = req.body
  const sql = `INSERT INTO milking_record (cow_id, date, quantity) VALUES (?, ?, ?)`
  openDB().then((db) => {
    db.run(sql, [cowId, date, quantity], function (err) {
      if (err) {
        console.error(err.message)
        return res.status(400).send(err.message)
      }
      console.log(`Added milking record with id ${this.lastID}`)
      res.redirect("/milking_records")
    })
  })
}

exports.getMilkingRecords = (req, res) => {
  const cowId = req.params.id
  const sql = `SELECT * FROM milking_record WHERE cow_id = ?`
  openDB().then((db) => {
    db.all(sql, [cowId], (err, rows) => {
      if (err) {
        console.error(err.message)
        return res.status(400).send(err.message)
      }
      closeDB()
      res.render("milkingRecords", { records: rows })
    })
  })
}

exports.deleteMilkingRecord = (req, res) => {
  const recordId = req.params.id
  const sql = `DELETE FROM milking_record WHERE id = ?`
  openDB().then((db) => {
    db.run(sql, [recordId], function (err) {
      if (err) {
        console.error(err.message)
        return res.status(400).send(err.message)
      }
      console.log(`Deleted milking record with id ${recordId}`)
      res.redirect("/milking_records")
    })
  })
}

// CRUD operations for weight_record table
exports.addWeigh = (req, res) => {
  const { cow_id, weight, measurement_date } = req.body
  // Check if the cow exists
  const checkCowSql = `SELECT id FROM cow WHERE id = ${cow_id} and type ="milk"`
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
        res.redirect("/milk_cows")
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
        milkCow: true,
        weight: true,
        first: "milk_cows",
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
      res.redirect(`/milk_cows/weight/details?id=${cow_id}`)
    })
  })
}
exports.getUpdateWeight = (req, res) => {
  // Fetch the milk cow data from the database
  const weightRecordID = req.query.id // Assuming you pass the ID as a query parameter
  openDB().then((openDB) =>
    openDB.get(
      "SELECT * FROM weight_tracking WHERE id = ?",
      [weightRecordID],
      (err, row) => {
        if (err) {
          console.error("Error retrieving milk cow:", err.message)
          closeDB()
          return res.status(400).send(err.message)
        } else {
          closeDB()
          res.render("updateDailyInformation", {
            record: row,
            milkCow: true,
            weight: true,
            first: "milk_cows",
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
      res.redirect(`/milk_cows/weight/details?id=${cow_id}`)
    })
  )
}

// CRUD operations for fodder_tracking table
exports.addFodder = (req, res) => {
  const { cow_id, fodder_amount, feeding_date } = req.body
  // Check if the cow exists
  const checkCowSql = `SELECT id FROM cow WHERE id = ${cow_id} and type ="milk"`
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
        res.redirect("/milk_cows")
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
        milkCow: true,
        fodder: true,
        first: "milk_cows",
        second: "fodder",
      })
    })
  })
}
exports.getUpdateFodders = (req, res) => {
  // Fetch the milk cow data from the database
  const weightRecordID = req.query.id // Assuming you pass the ID as a query parameter
  openDB().then((openDB) =>
    openDB.get(
      "SELECT * FROM fodder_tracking WHERE id = ?",
      [weightRecordID],
      (err, row) => {
        if (err) {
          console.error("Error retrieving milk cow:", err.message)
          closeDB()
          return res.status(400).send(err.message)
        } else {
          closeDB()
          res.render("updateDailyInformation", {
            record: row,
            milkCow: true,
            fodder: true,
            first: "milk_cows",
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
      console.log(`Updated fodder record with id ${id}`)
      res.redirect(`/milk_cows/fodder/details?id=${cow_id}`)
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
      console.log(`Deleted fodder record with id ${id}`)
      res.redirect(`/milk_cows/fodder/details?id=${cow_id}`)
    })
  })
}
// CRUD operations for miking_data table
exports.addMilking = (req, res) => {
  const { cow_id, milk_amount, milking_datetime } = req.body
  // Check if the cow exists
  const checkCowSql = `SELECT id FROM cow WHERE id = ${cow_id} and type ="milk"`
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
      const insertSql = `INSERT INTO milking_data (cow_id, milk_amount, milking_datetime) VALUES (?, ?, ?)`
      db.run(
        insertSql,
        [cow_id, milk_amount, milking_datetime],
        function (err) {
          if (err) {
            console.error(err.message)
            return res.status(400).send(err.message)
          }
          console.log(`Added milked record with id ${this.lastID}`)
          res.redirect("/milk_cows")
        }
      )
    })
  })
}
exports.getMilking = (req, res) => {
  const cowId = req.query.id
  const sql = `SELECT * FROM milking_data WHERE cow_id = ?`
  openDB().then((db) => {
    db.all(sql, [cowId], (err, rows) => {
      console.log(rows)
      if (err) {
        console.error(err.message)
        return res.status(400).send(err.message)
      }
      closeDB()
      res.render("dailyDashboard", {
        records: rows,
        milkCow: true,
        milking: true,
        first: "milk_cows",
        second: "milking",
      })
    })
  })
}
exports.getUpdateMilking = (req, res) => {
  // Fetch the milk cow data from the database
  const weightRecordID = req.query.id // Assuming you pass the ID as a query parameter
  openDB().then((openDB) =>
    openDB.get(
      "SELECT * FROM milking_data WHERE id = ?",
      [weightRecordID],
      (err, row) => {
        if (err) {
          console.error("Error retrieving milk cow:", err.message)
          closeDB()
          return res.status(400).send(err.message)
        } else {
          closeDB()
          res.render("updateDailyInformation", {
            record: row,
            milkCow: true,
            milking: true,
            first: "milk_cows",
            second: "milking",
          })
        }
      }
    )
  )
}
exports.updateMilking = (req, res) => {
  const { milk_amount, milking_datetime, id, cow_id } = req.body
  // Weight record exists, update the data
  const updateSql = `UPDATE milking_data SET milk_amount = ?, milking_datetime = ? WHERE id = ?`
  openDB().then((openDB) =>
    openDB.run(updateSql, [milk_amount, milking_datetime, id], function (err) {
      if (err) {
        console.error(err.message)
        return res.status(400).send(err.message)
      }
      console.log(`Updated milking record with id ${id}`)
      res.redirect(`/milk_cows/milking/details?id=${cow_id}`)
    })
  )
}
exports.deleteMilking = (req, res) => {
  const { id, cow_id } = req.body
  console.log(req.body)
  const sql = `DELETE FROM milking_data WHERE id = ?`
  openDB().then((db) => {
    db.run(sql, [id], function (err) {
      if (err) {
        console.error(err.message)
        return res.status(400).send(err.message)
      }
      console.log(`Deleted milking record with id ${id}`)
      res.redirect(`/milk_cows/milking/details?id=${cow_id}`)
    })
  })
}

// CRUD operations for reproduction table
exports.addReproduction = (req, res) => {
  const {
    cow_id,
    code_of_pollinated_animal,
    number_of_pollination,
    number_of_births,
    date_of_births,
    date_of_estrus,
    date_of_insemination,
  } = req.body
  const reproductive_competence = 0
  // Check if the cow exists
  const checkCowSql = `SELECT id FROM cow WHERE id = ${cow_id} and type ="milk"`
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
      const insertSql = `INSERT INTO reproduction_tracking (
        cow_id,
        code_of_pollinated_animal,
        number_of_pollination,
        number_of_births,
        date_of_births,
        date_of_estrus,
        date_of_insemination)
        VALUES (?, ?, ?, ?, ?, ?, ?)`
      db.run(
        insertSql,
        [
          cow_id,
          code_of_pollinated_animal,
          number_of_pollination,
          number_of_births,
          date_of_births,
          date_of_estrus,
          date_of_insemination,
        ],
        function (err) {
          if (err) {
            console.error(err.message)
            return res.status(400).send(err.message)
          }
          console.log([
            cow_id,
            code_of_pollinated_animal,
            number_of_pollination,
            number_of_births,
            date_of_births,
            date_of_estrus,
            date_of_insemination,
          ])
          console.log(`Added reproduction record with id ${this.lastID}`)
          res.redirect("/milk_cows")
        }
      )
    })
  })
}
exports.getReproductions = (req, res) => {
  const cowId = req.query.id
  const sql = `SELECT * FROM reproduction_tracking WHERE cow_id = ?`
  openDB().then((db) => {
    db.all(sql, [cowId], (err, rows) => {
      if (err) {
        console.error(err.message)
        return res.status(400).send(err.message)
      }
      closeDB()
      res.render("dailyDashboard", {
        records: rows,
        milkCow: true,
        reproduction: true,
        first: "milk_cows",
        second: "reproduction",
      })
    })
  })
}
exports.getUpdateReproductions = (req, res) => {
  // Fetch the milk cow data from the database
  const weightRecordID = req.query.id
  openDB().then((openDB) =>
    openDB.get(
      "SELECT * FROM reproduction_tracking WHERE id = ?",
      [weightRecordID],
      (err, row) => {
        if (err) {
          console.error("Error retrieving milk cow:", err.message)
          closeDB()
          return res.status(400).send(err.message)
        } else {
          closeDB()
          res.render("updateDailyInformation", {
            record: row,
            milkCow: true,
            reproduction: true,
            first: "milk_cows",
            second: "reproduction",
          })
        }
      }
    )
  )
}
// the object object error
exports.updateReproduction = (req, res) => {
  const {
    id,
    cow_id,
    code_of_pollinated_animal,
    number_of_pollination,
    number_of_births,
    date_of_births,
    date_of_estrus,
    date_of_insemination,
  } = req.body
  // Weight record exists, update the data
  const updateSql = `UPDATE reproduction_tracking
      SET cow_id = ?,
      code_of_pollinated_animal = ?,
      number_of_pollination = ?,
      number_of_births = ?,
      date_of_births = ?,
      date_of_estrus = ?,
      date_of_insemination = ?
      WHERE id = ?`
  openDB().then((openDB) =>
    openDB.run(
      updateSql,
      [
        cow_id,
        code_of_pollinated_animal,
        number_of_pollination,
        number_of_births,
        date_of_births,
        date_of_estrus,
        date_of_insemination,
        id,
      ],
      function (err) {
        if (err) {
          console.error(err.message)
          return res.status(400).send(err.message)
        }
        console.log(`Updated reproduction record with id ${id}`)
        res.redirect(`/milk_cows/reproduction/details?id=${cow_id}`)
      }
    )
  )
}
exports.deleteReproduction = (req, res) => {
  const { id, cow_id } = req.body
  console.log(req.body)
  const sql = `DELETE FROM reproduction_tracking WHERE id = ?`
  openDB().then((db) => {
    db.run(sql, [id], function (err) {
      if (err) {
        console.error(err.message)
        return res.status(400).send(err.message)
      }
      console.log(`Deleted reproduction record with id ${id}`)
      res.redirect(`/milk_cows/reproduction/details?id=${cow_id}`)
    })
  })
}
