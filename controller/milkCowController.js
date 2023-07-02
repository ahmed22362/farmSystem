const { closeDB, openDB, openDBAsync } = require("../db/farmDB")

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
  strain = req.body.strain
  ownership = req.body.ownership
  strain = returnSecValue(req.body.strain)
  ownership = returnSecValue(req.body.ownership)
  req.body.strain = strain
  req.body.ownership = ownership
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

exports.getCowDetails = async (req, res) => {
  // Fetch the milk cow data from the database
  const db = await openDBAsync()
  const milkCowId = req.params.id // Assuming you pass the ID as a query parameter
  try {
    const cowWeight = await db.get(`SELECT *
      FROM weight_tracking
      WHERE cow_id = ${milkCowId}
      ORDER BY measurement_date DESC
      LIMIT 1`)
    const cowDetails = await db.get(`SELECT * FROM cow WHERE id = ${milkCowId}`)
    cowDetails.weight = cowWeight.weight
    res.render("detailsCow", { animal: cowDetails, milkCow: true })
  } catch (error) {
    return res.status(400).send(`<h1>${error.message}</h1>`)
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

exports.addMilkCow = async (req, res) => {
  req.body.type = "milk"
  req.body.gender = "female"
  strain = req.body.strain
  ownership = req.body.ownership
  strain = returnSecValue(req.body.strain)
  ownership = returnSecValue(req.body.ownership)
  req.body.strain = strain
  req.body.ownership = ownership
  console.log(req.body, strain, ownership)
  const columns = Object.keys(req.body).join(", ")
  const values = Object.values(req.body)
    .map((value) => `"${value}"`)
    .join(", ")

  const db = await openDBAsync()
  const sql = `INSERT INTO cow (${columns}) VALUES (${values})`
  try {
    const cow = await db.run(sql)
    // Get the ID of the newly inserted cow
    const cowId = cow.lastID
    const date = new Date()
      .toLocaleDateString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .split("/")
      .reverse()
      .join("-")
    console.log(date)
    // Add weight tracking record
    const weightSql = `INSERT INTO weight_tracking (weight, cow_id,measurement_date) VALUES (${req.body.weight}, ${cowId},'${date}')`
    await db.run(weightSql)

    res.redirect("/milk_cows")
  } catch (error) {
    console.log(error.message)
    return res.status(400).end(`Something wrong happened: ${error.message}`)
  }
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
  const { cow_id, coarse_fodder, concentrated_feed, feeding_date } = req.body
  const fodder_amount = Number(coarse_fodder) + Number(concentrated_feed)

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
      const insertSql = `INSERT INTO fodder_tracking (cow_id, fodder_amount, feeding_date,concentrated_feed,coarse_fodder ) VALUES (?, ?, ?, ?, ?)`
      db.run(
        insertSql,
        [cow_id, fodder_amount, feeding_date, concentrated_feed, coarse_fodder],
        function (err) {
          if (err) {
            console.error(err.message)
            return res.status(400).send(err.message)
          }
          console.log(`Added fodder record with id ${this.lastID}`)
          res.redirect("/milk_cows")
        }
      )
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
  const { coarse_fodder, concentrated_feed, feeding_date, id, cow_id } =
    req.body
  // Weight record exists, update the data
  const updateSql = `UPDATE fodder_tracking SET concentrated_feed = ?, feeding_date = ?,coarse_fodder = ? WHERE id = ?`
  openDB().then((openDB) =>
    openDB.run(
      updateSql,
      [concentrated_feed, feeding_date, coarse_fodder, id],
      function (err) {
        if (err) {
          console.error(err.message)
          return res.status(400).send(err.message)
        }
        console.log(`Updated fodder record with id ${id}`)
        res.redirect(`/milk_cows/fodder/details?id=${cow_id}`)
      }
    )
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
  const {
    cow_id,
    milk_amount,
    milking_datetime,
    fat_percentage,
    milk_season_number,
    length_of_dry_period,
  } = req.body
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
      const insertSql = `INSERT INTO milking_data (cow_id, milk_amount, milking_datetime,fat_percentage,milk_season_number,length_of_dry_period) VALUES (?, ?, ?, ?, ?, ?)`
      db.run(
        insertSql,
        [
          cow_id,
          milk_amount,
          milking_datetime,
          fat_percentage,
          milk_season_number,
          length_of_dry_period,
        ],
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
  console.log("here is update")
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
  console.log("here is post update")
  const {
    id,
    milk_amount,
    milking_datetime,
    fat_percentage,
    milk_season_number,
    length_of_dry_period,
    cow_id,
  } = req.body // Weight record exists, update the data
  console.log("this is here")
  const updateSql = `UPDATE milking_data SET milk_amount = ?, milking_datetime = ?, fat_percentage = ?, milk_season_number = ?,length_of_dry_period = ? WHERE id = ?`
  openDB().then((openDB) =>
    openDB.run(
      updateSql,
      [
        milk_amount,
        milking_datetime,
        fat_percentage,
        milk_season_number,
        length_of_dry_period,
        id,
      ],
      function (err) {
        if (err) {
          console.error(err.message)
          return res.status(400).send(err.message)
        }
        res.redirect(`/milk_cows/milking/details?id=${cow_id}`)
      }
    )
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
exports.addReproduction = async (req, res) => {
  const {
    cow_id,
    code_of_pollinated_animal,
    number_of_pollination,
    number_of_births,
    date_of_births,
    date_of_estrus,
    date_of_insemination,
    date_of_first_ovulation_after_birth,
    number_of_movement,
    number_of_estrus,
  } = req.body
  // Check if the cow exists
  const checkCowSql = `SELECT id ,date_of_first_birth FROM cow WHERE id = ${cow_id} and type ="milk"`
  try {
    const db = await openDBAsync()
    const cow = await db.get(checkCowSql)
    if (!cow) {
      return res.status(404).send("<h1>Cow not found</h1>")
    }
    const lastBirth = await db.get(
      `SELECT max(date_of_births) as last_date_of_birth ,count(*) as birth_count from reproduction_tracking
       where cow_id = ${cow_id}`
    )
    const numberOfDays =
      (new Date(lastBirth.last_date_of_birth) -
        new Date(cow.date_of_first_birth)) /
      (24 * 60 * 60 * 1000)
    var reproductive_competence =
      (365 * (lastBirth.birth_count - 1) * 100) / numberOfDays
    reproductive_competence = parseFloat(reproductive_competence).toFixed(2)
    const insertSql = `INSERT INTO reproduction_tracking (
        cow_id,
        code_of_pollinated_animal,
        number_of_pollination,
        number_of_births,
        date_of_births,
        date_of_estrus,
        date_of_insemination,
        reproductive_competence,
        date_of_first_ovulation_after_birth,
        number_of_estrus,
        number_of_movement
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    await db.run(insertSql, [
      cow_id,
      code_of_pollinated_animal,
      number_of_pollination,
      number_of_births,
      date_of_births,
      date_of_estrus,
      date_of_insemination,
      reproductive_competence,
      date_of_first_ovulation_after_birth,
      number_of_estrus,
      number_of_movement,
    ])
    console.log(`Added reproduction record with id ${this.lastID}`)
    res.redirect("/milk_cows")
  } catch (error) {
    console.log(error.message)
    return res.status(400).send(error.message)
  }
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
      console.log(rows)
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
    number_of_movement,
    number_of_estrus,
  } = req.body
  // Weight record exists, update the data
  const updateSql = `UPDATE reproduction_tracking
      SET cow_id = ?,
      code_of_pollinated_animal = ?,
      number_of_pollination = ?,
      number_of_births = ?,
      date_of_births = ?,
      date_of_estrus = ?,
      date_of_insemination = ?,
      number_of_movement = ?,
      number_of_estrus = ?
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
        number_of_movement,
        number_of_estrus,
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
function returnSecValue(params) {
  if (Array.isArray(params) && params.length > 1) {
    params = params.filter(Boolean)
    console.log(params)
    if (params.length > 1) {
      return params[1]
    } else {
      return params[0]
    }
  }
}
