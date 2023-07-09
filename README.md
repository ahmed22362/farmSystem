# Milk Farm Management System

The Milk Farm Management System is a web-based application that helps manage and monitor the operations of a milk farm. It provides functionalities for tracking milk production, managing cow records, and calculating costs associated with milk production. The system offers features such as recording milking data, tracking cow information, generating statistics, and calculating expenses.

## Features

- **Dashboard**: Provides an overview of key metrics such as the total number of milking cows, the total amount of milk produced, and other relevant statistics.

- **Cow Management**: Allows the addition and management of cow records, including details such as cow ID, breed, weight, milking history, vaccination records, and other relevant information.

- **Milking Records**: Enables the recording and tracking of milking data, including the quantity of milk produced, milking date and time, and associated cow information.

- **Statistics**: Generates visual charts and graphs to display trends and patterns in milk production, cow population, and other statistical information.

- **Cost Calculation**: Provides a feature to calculate costs based on user input, such as the cost per liter of milk and the total milk production. The calculated cost is displayed dynamically on the user interface.

## Getting Started

### Prerequisites

- Web server environment (e.g., Apache, Nginx) with Nodejs support.
- SQLite database.

### Installation

1. Clone the repository or download the project files to your local machine.

```shell
git clone https://github.com/ahmed22362/farmSystem.git
```

2. Navigate to the project directory:

```shell
cd farmSystem
```

3. Set up the database:

- Create a new SQLite database file or use an existing one.
- Configure the database connection in the db/farmDB.js file.

4. Start the application:

```shell
npm start
```

5. Access the application:

- Open a web browser and navigate to http://localhost:3000.

## Usage

1. Use the Dashboard to get an overview of the key metrics and statistics related to milk production.

2. Manage Cow records by adding, editing, and deleting cow information.

3. Record Milking data by entering the quantity of milk produced, milking date and time, and associated cow information.

4. View Statistics to analyze trends and patterns in milk production and cow population.

5. Calculate Costs by entering the cost per liter of milk and the total milk production.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

- [Express.js](https://expressjs.com/) - Web framework for Node.js
- [EJS](https://ejs.co/) - Templating engine for Node.js
- [SQLite](https://www.sqlite.org/) - Embedded database engine

- [Chart.js](https://www.chartjs.org/) - Used for generating charts and graphs.
- [FontAwesome](https://fontawesome.com/) - Used for icons.
