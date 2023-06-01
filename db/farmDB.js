const sqlite3 = require("sqlite3").verbose()
// open database in memory
db = new sqlite3.Database("./db/farm.db", (err) => {
  if (err) {
    console.error(err.message)
  }
  console.log("Connected to the farm database.")
})

const closeDB = () => {
  if (db.open) {
    db.close((err) => {
      if (err) {
        console.error("Error closing database:", err.message)
      } else {
        console.log("Database connection closed.")
      }
    })
  } else {
    console.log("Database is already closed.")
  }
}
const openDB = () => {
  return new Promise((resolve, reject) => {
    const openedDB = new sqlite3.Database("./db/farm.db", (err) => {
      if (err) {
        console.error(err.message)
        reject(err)
      }
      console.log("Connected to the farm database.")
      resolve(openedDB)
    })
  })
}
// close the database connection
const createTables = () => {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL
  )`,
    (err) => {
      if (err) {
        console.error("Error creating table:", err.message)
        closeDB()
      } else {
        console.log("Users table created.")
        closeDB()
      }
    }
  )
  db.run(
    `CREATE TABLE IF NOT EXISTS milk_cow (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      strain TEXT NOT NULL,
      weight REAL NOT NULL,
      ownership TEXT NOT NULL,
      birth_date DATE,
      date_of_buy DATE,
      weight_on_birth REAL ,
      weight_on_buy REAL ,
      father_code TEXT ,
      mother_code TEXT,
      immunizations TEXT,
      diseases TEXT,
      notes TEXT,
      last_pollination_time DATE,
      code_of_pollinated_animal TEXT,
      number_of_pollination INTEGER,
      estrus DATE,
      reproductive_competence REAL

  )`,
    (err) => {
      if (err) {
        console.error("Error creating table:", err.message)
      } else {
        console.log("milk_cow table created.")
      }
    }
  )
  db.run(
    `CREATE TABLE IF NOT EXISTS meat_cow (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    strain TEXT NOT NULL,
    weight REAL NOT NULL,
    gender TEXT NOT NULL,
    ownership TEXT NOT NULL,
    birth_date DATE,
    date_of_buy DATE,
    weight_on_birth REAL ,
    weight_on_buy REAL ,
    father_code TEXT ,
    mother_code TEXT,
    immunizations TEXT,
    diseases TEXT,
    notes TEXT
  )`,
    (err) => {
      if (err) {
        console.error("Error creating table:", err.message)
      } else {
        console.log("meat_cow table created.")
      }
    }
  )
}

createTables()

module.exports = { db, closeDB, openDB }
