const fodderData = require("../db/fodderConfig")
const { openDBAsync } = require("../db/farmDB")
let data = {}
let rateCode = {}
exports.getFodderInfo = async (req, res) => {
  if (!req.body.cow_id && !req.body.weight) {
    res.status(400).end("<h1>please add needed data</h1>")
  }
  console.log(req.body)
  let weight = req.body.weight
  let rate = req.body.rate_of_increase
  rateCode.rate = rate ? rate : undefined
  let cowCode = req.body.weight
  rateCode.cowCode = cowCode ? cowCode : undefined
  if (req.body.cow_id) {
    cowCode = req.body.cow_id
    rateCode.cowCode = cowCode
    cowCode.trim().replace(/(\r\n|\n|\r)/gm, "")
    const db = await openDBAsync()
    const cow = await db.all(`SELECT *
    FROM weight_tracking WHERE cow_id = ${cowCode}
    ORDER BY measurement_date DESC limit 2;`)
    if (cow.length < 2) {
      return res
        .status(400)
        .end("<h1>there are no enough weight records for this cow</h1>")
    }
    const date1 = new Date(cow[0].measurement_date)
    const date2 = new Date(cow[1].measurement_date)
    weight = cow[0].weight
    const timeDiff = Math.abs(date2.getTime() - date1.getTime())
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24))
    rate = (cow[0].weight - cow[1].weight) / diffDays
    console.log(cow, diffDays, rate)
    rateCode.cowCode = cowCode
    rateCode.rate = rate
    console.log(rateCode)
  }
  const totalFodder = weight * 3
  const coarseFodder = (totalFodder * 40) / 100
  const ConcentratedFodder = (totalFodder * 60) / 100
  const powerProtein = calculateTotalPower(weight, rate)
  powerProtein.totalFodder = totalFodder
  powerProtein.coarseFodder = coarseFodder
  powerProtein.ConcentratedFodder = ConcentratedFodder
  data = powerProtein
  data.weight = weight
  res.redirect("fattening_fodder/ingredient")
}
exports.getFodderIngredientRouter = (req, res) => {
  res.render("dietAddCowDet", {
    fattening: true,
    proteinResult: data,
    ingredient: true,
    endpoint: "fattening_fodder/ingredient",
    cowCode: rateCode.cowCode,
    rate: rateCode.rate,
  })
}
exports.getFodderIngredient = (req, res) => {
  console.log(req.body)
  const fodderType = req.body.selectedValues.split(",")
  // for(value in req.body.selectedValues)
  let amount = []
  console.log(fodderType)
  // check if the value empty or not
  if (fodderType[0].length >= 1) {
    amount = calculateFodderAmount(
      fodderType,
      data.totalPower,
      data.totalFodder,
      data.totalProtein
    )
    console.log(amount)
  }
  console.log(data)
  res.render("dietAddCowDet", {
    fattening: true,
    proteinResult: data,
    ingredient: true,
    endpoint: "fattening_fodder/ingredient",
    cowCode: rateCode.cowCode,
    fodderAmount: true,
    data: amount,
    rate: rateCode.rate,
  })
}
exports.getMilkingInfo = async (req, res) => {
  if (!req.body.cow_id && !req.body.weight) {
    res.status(400).end("<h1>please add needed data</h1>")
  }
  console.log(req.body, "here")
  let weight = req.body.weight
  data.cowCode = req.body.weight
  let avg_yield = req.body.avg_yield
  let fat_percentage = req.body.fat_percentage
  if (fat_percentage) {
    fat_percentage = fat_percentage.filter(Boolean)
  }
  data.fatPer = fat_percentage[0]
  if (req.body.cow_id) {
    const cowCode = req.body.cow_id
    cowCode.trim().replace(/(\r\n|\n|\r)/gm, "")
    const db = await openDBAsync()

    const milkingData = await db.get(`SELECT sum(milk_amount) as milk_amount,
        count(milk_amount) as cnt
        from milking_data
        where cow_id = ${cowCode};`)
    const weightData = await db.get(`SELECT *
        FROM weight_tracking WHERE cow_id = ${cowCode}
        ORDER BY measurement_date DESC limit 1;`)
    const milkingFatData = await db.get(`select *
    from milking_data
    where cow_id = ${cowCode}
    ORDER BY milking_datetime DESC;`)
    console.log(milkingData, weightData, milkingFatData)
    if (milkingData.cnt == 0) {
      return res
        .status(400)
        .end("<h1>there are no enough miking records for this cow</h1>")
    }
    if (!weightData) {
      return res
        .status(400)
        .end("<h1>there are no enough weight records for this cow</h1>")
    }
    if (!milkingFatData) {
      return res
        .status(400)
        .end(
          "<h1>there are no enough milk fat percent in the records for this cow</h1>"
        )
    }
    fat_percentage = milkingFatData.fat_percentage
    avg_yield = roundTo2(milkingData.milk_amount / milkingData.cnt)
    weight = weightData.weight
    const totalFodder = getMilkingTotalFodder(avg_yield, weightData.weight)
    data.cowCode = cowCode
    data.totalFodder = roundTo2(totalFodder)
  } else {
    data.totalFodder = getMilkingTotalFodder(avg_yield, weight)
  }

  const preservativeEnergy = roundTo2(0.025 * weight ** 0.75)
  const preservativeProtein = roundTo2(1.75 * weight ** 0.75)
  const productiveEnergy = roundTo2(
    (115 * fat_percentage + 280.6) * (100 / 75) * (1 / 3761)
  )
  console.log(fat_percentage)
  const productiveProtein = roundTo2((1.597 + fat_percentage * 0.446) * 20)
  const coarseFodder = roundTo2((data.totalFodder * 70) / 100)
  const ConcentratedFodder = roundTo2((data.totalFodder * 30) / 100)
  const vitA = weight * 75
  const vitB = weight * 6.6
  data.avg_yield = avg_yield
  data.preservativeEnergy = preservativeEnergy
  data.productiveEnergy = productiveEnergy
  data.totalEnergy = preservativeEnergy + productiveEnergy
  data.productiveProtein = productiveProtein
  data.preservativeProtein = preservativeProtein
  data.totalProtein = productiveProtein + preservativeProtein
  data.coarseFodder = coarseFodder
  data.ConcentratedFodder = ConcentratedFodder
  data.vitA = vitA
  data.vitB = vitB
  data.avg = avg_yield
  data.fat_percentage = fat_percentage
  res.redirect("milking_fodder/ingredient")
}
exports.getMilkingIngredientRouter = (req, res) => {
  res.render("dietAddCowDet", {
    milking: true,
    proteinResult: data,
    ingredient: true,
    endpoint: "milking_fodder/ingredient",
    cowCode: data.cowCode,
    avg_yield: data.avg,
    fatPer: data.fatPer,
  })
}
exports.getMilkingFodderIngredient = (req, res) => {
  console.log(req.body, data)
  const fodderType = req.body.selectedValues.split(",")
  // for(value in req.body.selectedValues)
  let amount = []
  console.log(fodderType)
  if (fodderType[0].length >= 1) {
    totalPower = data.preservativeEnergy + data.productiveEnergy
    totalProtein = data.preservativeProtein + data.productiveProtein
    amount = calculateFodderAmount(
      fodderType,
      totalPower,
      data.totalFodder,
      totalProtein
    )
    console.log(amount)
  }
  console.log(data)
  res.render("dietAddCowDet", {
    milking: true,
    proteinResult: data,
    ingredient: true,
    endpoint: "milking_fodder/ingredient",
    cowCode: data.cowCode,
    fodderAmount: true,
    data: amount,
    avg_yield: data.avg,
    fatPer: data.fatPer,
  })
}
function calculateTotalPower(weight, increaseRate) {
  const starchRate = getStarchRate(weight)
  const staticPower = 0.025 * Math.pow(weight, 0.75) // in kg
  const staticProtein = 1.75 * Math.pow(weight, 0.75) // in gram
  const productionPower = starchRate * increaseRate // in kg
  const productionProtein = productionPower * 0.2 * 1000 // in gram
  const totalPower = parseFloat(staticPower + productionPower).toFixed(4)
  const totalProtein = parseFloat(staticProtein + productionProtein).toFixed(4)
  return { totalPower, totalProtein }
}
function getStarchRate(w) {
  var rate
  const weight = Number(w)
  if (weight >= 300 && weight <= 350) {
    rate = 3.5
  } else if (weight >= 150 && weight <= 250) {
    rate = 2.5
  } else {
    rate = 1
  }
  return rate
}
function getMilkingTotalFodder(avg_yield, w) {
  var fodder
  const avg = Number(avg_yield)
  const weight = Number(w)
  if (avg >= 15) {
    fodder = weight * 0.03
  } else if (avg >= 10 && avg < 15) {
    fodder = weight * 0.025
  } else if (avg < 10) {
    fodder = weight * 0.02
  }
  return fodder
}
function calculateFodderAmount(
  fodderTypes,
  totalPower,
  totalFodderAmount,
  totalProteinPercentage
) {
  const fodderAmounts = []

  // Calculate the amount of each fodder
  for (const fodderType of fodderTypes) {
    const { proteinPercentage, powerPer100g } = fodderData[fodderType]
    const fodderAmount =
      (totalProteinPercentage / proteinPercentage) *
      (totalPower / powerPer100g) *
      100
    fodderAmounts.push({ type: fodderType, amount: fodderAmount })
  }

  // Normalize the fodder amounts to the total fodder amount
  const totalFodderAmountSum = fodderAmounts.reduce(
    (sum, { amount }) => sum + amount,
    0
  )
  const normalizationFactor = totalFodderAmount / totalFodderAmountSum
  const normalizedFodderAmounts = fodderAmounts.map(({ type, amount }) => ({
    type,
    amount: parseFloat(amount * normalizationFactor).toFixed(4),
  }))

  return normalizedFodderAmounts
}
function roundTo2(num) {
  return Math.round(num * 100) / 100
}
