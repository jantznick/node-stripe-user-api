const express = require('express')
const { sequelize } = require('./api_models')

require('dotenv').config()

const dbConnection = sequelize.authenticate();

dbConnection.then(result => {
	console.log('DB Connection has been established successfully.');
})

const app = express();

app.use(express.static('public'));

app.use("*", (req, res, next) => {
	next();
})

app.use("/api", (req, res) => {
	res.send('hello world');
});

app.use("*", (req, res) => {
	res.send('404 error');
})

app.listen(3000, () => {
	console.log("Server running on port 3000");
});