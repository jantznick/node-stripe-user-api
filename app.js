import express from 'express';

import { sequelize } from './api_models';

require('dotenv').config()

try {
	await sequelize.authenticate();
	console.log('DB Connection has been established successfully.');
} catch (error) {
	console.error('Unable to connect to the database:', error);
}

const app = express();

app.use(express.static('public'));

app.use("*", (req, res, next) => {
	next();
})

app.use("/api", require('./api/routes/index'));

app.listen(3000, () => {
	console.log("Server running on port 3000");
});