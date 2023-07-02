const { closeDB, openDB, openDBAsync } = require("../db/farmDB")

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

exports.addMeatCow = async (req, res) => {
  req.body.type = "meat"
  strain = returnSecValue(req.body.strain)
  ownership = returnSecValue(req.body.ownership)
  req.body.strain = strain
  req.body.ownership = ownership
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
    const weightSql = `INSERT INTO weight_tracking (weight, cow_id, measurement_date) VALUES (${req.body.weight}, ${cowId},'${date}')`
    await db.run(weightSql)

    res.redirect("/meat_cows")
  } catch (error) {
    console.log(error.message)
    return res.status(400).end(`Something wrong happened: ${error.message}`)
  }
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
  strain = req.body.strain
  ownership = req.body.ownership
  if (req.body.strain) {
    strain = returnSecValue(req.body.strain)
    req.body.strain = strain
  }
  if (req.body.ownership) {
    ownership = returnSecValue(req.body.ownership)
    req.body.ownership = ownership
  }
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
exports.addWeigh = async (req, res) => {
  const { cow_id, weight, measurement_date } = req.body
  // Check if the cow exists
  try {
    const db = await openDBAsync()
    const checkCowSql = `SELECT id FROM cow WHERE id = ${cow_id} and type ="meat"`
    const insertSql = `INSERT INTO weight_tracking (cow_id, weight, measurement_date , rate_of_increase) VALUES (?, ?, ?, ?)`
    const checkCow = await db.get(checkCowSql)
    if (!checkCow) {
      return res.status(404).send("<h1>Cow not found</h1>")
    }
    const result = await db.run(insertSql, [cow_id, weight, measurement_date])
    console.log(`Added weight record with id ${this.lastID}`)
    res.redirect("/meat_cows")
  } catch (error) {
    console.log(error)
    res.status(400).end(error.message)
  }
}

exports.getWeights = async (req, res) => {
  const cowId = req.query.id
  try {
    const db = await openDBAsync()
    const sql = `SELECT * FROM weight_tracking WHERE cow_id = ${cowId} ORDER BY measurement_date DESC;`
    const rows = await db.all(sql)
    res.render("dailyDashboard", {
      records: rows,
      meatCow: true,
      weight: true,
      first: "meat_cows",
      second: "weight",
    })
  } catch (error) {
    console.log(error.message)
    return res.status(400).end(error.message)
  }
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
  const { cow_id, coarse_fodder, concentrated_feed, feeding_date } = req.body
  const fodder_amount = Number(coarse_fodder) + Number(concentrated_feed)
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
          res.redirect("/meat_cows")
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
        console.log(`Updated weight record with id ${id}`)
        res.redirect(`/meat_cows/fodder/details?id=${cow_id}`)
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
      console.log(`Deleted weight record with id ${id}`)
      res.redirect(`/meat_cows/fodder/details?id=${cow_id}`)
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
