const { db, closeDB, openDB } = require("./farmDB")
exports.query = (sql) => {
  return new Promise((resolve, reject) => {
    db.run(sql, (err, rows) => {
      if (err) {
        console.log(err.message)
        reject(err)
      }
      console.log(`the query done: ${sql}`)
      resolve(rows)
    })
    closeDB()
  })
}
exports.queryAll = (sql) => {
  return new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) {
        console.log(err.message)
        reject(err)
      }
      console.log(`the query done: ${sql}`)
      resolve(rows)
    })
    closeDB()
  })
}
