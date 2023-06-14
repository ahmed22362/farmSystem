const { openDB, openDBAsync } = require("./../db/farmDB")

exports.getCountOfMilkedCows = async () => {
  try {
    const db = await openDBAsync()
    const row = await db.get(
      `SELECT COUNT(DISTINCT cow_id) AS cow_count
         FROM milking_data`
    )
    return row.cow_count
  } catch (error) {
    console.error("Error retrieving milking count:", error)
    throw error
  }
}
exports.getMilkingAmount = async () => {
  try {
    const db = await openDBAsync()
    const row = await db.get(
      `SELECT sum(milk_amount) as milking_amount
        FROM milking_data;`
    )
    return row.milking_amount
  } catch (error) {
    console.error("Error retrieving milking amount:", error)
    throw error
  }
}
exports.getHighestMilkProduction = async () => {
  try {
    const db = await openDBAsync()
    const row = await db.get(
      `SELECT max(milk_amount) as highestMilkProduction from milking_data;`
    )
    return row.highestMilkProduction
  } catch (error) {
    console.error("Error retrieving highest milking amount:", error)
    throw error
  }
}
exports.getAllMilkingRecords = async () => {
  try {
    const db = await openDBAsync()
    const rows = await db.all(
      `SELECT * from milking_data ORDER BY milking_datetime ;`
    )
    return rows
  } catch (error) {
    console.error("Error retrieving highest milking amount:", error)
    throw error
  }
}
