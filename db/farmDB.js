const sqlite3 = require("sqlite3").verbose()
const { open } = require("sqlite")

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
function openDBAsync() {
  return open({
    filename: "./db/farm.db",
    driver: sqlite3.Database,
  })
}
// close the database connection
const createTables = () => {
  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS cow (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      gender TEXT,
      strain TEXT NOT NULL,
      weight REAL DEFAULT 0 NOT NULL,
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
      date_of_first_birth DATE
       )`,
      (err) => {
        if (err) {
          console.error("Error creating table cow: ", err.message)
        } else {
          console.log("cow table created.")
        }
      }
    )
  })
  db.run(
    `CREATE TABLE IF NOT EXISTS milking_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cow_id INTEGER NOT NULL,
    milk_amount REAL NOT NULL,
    milking_datetime DATETIME NOT NULL,
    FOREIGN KEY (cow_id) REFERENCES cow (id)
  );`,
    (err) => {
      if (err) {
        console.error("Error creating table milking_data: ", err.message)
      } else {
        console.log("milking_data table created.")
      }
    }
  )
  db.run(
    `CREATE TABLE IF NOT EXISTS weight_tracking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cow_id INTEGER NOT NULL,
    weight REAL NOT NULL,
    measurement_date DATE NOT NULL,
    FOREIGN KEY (cow_id) REFERENCES cow (id)
    );`,
    (err) => {
      if (err) {
        console.error("Error creating table weight_tracking: ", err.message)
      } else {
        console.log("weight_tracking table created.")
      }
    }
  )
  db.run(
    `CREATE TABLE IF NOT EXISTS fodder_tracking (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cow_id INTEGER NOT NULL,
      fodder_amount REAL NOT NULL,
      feeding_date DATE NOT NULL,
      FOREIGN KEY (cow_id) REFERENCES cow (id)
  );`,
    (err) => {
      if (err) {
        console.error("Error creating table fodder_tracking: ", err.message)
      } else {
        console.log("fodder_tracking table created.")
      }
    }
  )
  db.run(
    `CREATE TABLE IF NOT EXISTS reproduction_tracking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cow_id INTEGER NOT NULL,
    code_of_pollinated_animal TEXT NOT NULL,
    number_of_pollination INTEGER,
    number_of_births INTEGER,
    date_of_births Date,
    date_of_estrus DATE,
    date_of_insemination DATE,
    reproductive_competence REAL,
    FOREIGN KEY (cow_id) REFERENCES cow (id)
    );`,
    (err) => {
      if (err) {
        console.error(
          "Error creating table reproduction_tracking: ",
          err.message
        )
      } else {
        console.log("fodder_tracking table created.")
      }
    }
  )
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL
)`,
    (err) => {
      if (err) {
        closeDB()
        console.error("Error creating table:", err.message)
      } else {
        closeDB()
        console.log("Users table created.")
      }
    }
  )
}

createTables()

module.exports = { db, closeDB, openDB, openDBAsync }
