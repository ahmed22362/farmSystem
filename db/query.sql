SELECT *
FROM cow;
SELECT *
FROM milking_data;
SELECT *
FROM weight_tracking;
SELECT *
FROM fodder_tracking;
SELECT *
FROM Users;
SELECT *
FROM cow
WHERE id = 4
    and type = "meat" CREATE TABLE IF NOT EXISTS fodder_tracking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cow_id INTEGER NOT NULL,
        fodder_amount REAL NOT NULL,
        feeding_date DATE NOT NULL,
        FOREIGN KEY (cow_id) REFERENCES cow (id)
    );
SELECT count(cow_id) as cowCount,
    cow_id
FROM milking_data
GROUP BY cow_id;
SELECT count(DISTINCT cow_id) cow_count
from milking_data;
SELECT *
from milking_data
SELECT max(milk_amount) as highestMilkProduction
from milking_data