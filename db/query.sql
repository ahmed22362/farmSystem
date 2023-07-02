SELECT *
FROM cow;
SELECT *
FROM milking_data;
SELECT *
FROM weight_tracking
WHERE cow_id = 1
ORDER BY measurement_date DESC;
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
SELECT *
from milking_data;
SELECT sum(milk_amount) as milk_amount,
    count(milk_amount) as cnt
from milking_data
where cow_id = 8;
SELECT max(milk_amount) as highestMilkProduction
from milking_data;
SELECT *
from cow;
select *
FROM reproduction_tracking;
SELECT max(date_of_births) as last_date_of_birth,
    count(*) as birth_count
from reproduction_tracking
where cow_id = 4;
alter TABLE fodder_tracking
add coarse_fodder TEXT;
SELECT *
from fodder_tracking
ALTER TABLE reproduction_tracking
ADD number_of_estrus integer;
ALTER TABLE weight_tracking
ADD rate_of_increase REAL;
SELECT *
from reproduction_tracking;
SELECT *
from cow
where id = 5;
INSERT INTO weight_tracking (weight, cow_id, measurement_date)
VALUES (654, 3, '24 / 06 / 2023');
SELECT sum(milk_amount) as milk_amount,
    count(milk_amount) as cnt,
    from milking_data
where cow_id = 2
ORDER BY milking_datetime DESC;
select *
from milking_data
where cow_id = 2
ORDER BY milking_datetime DESC;
INSERT INTO cow
SELECT *
from weight_tracking
select *
from weight_tracking
where cow_id = 1
order by measurement_date desc
limit 1;