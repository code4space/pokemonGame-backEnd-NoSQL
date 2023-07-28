require('dotenv').config()

const cors = require('cors');
const express = require('express');
const { connectToDatabase } = require('./config/config');
const { errorHandler } = require('./middleware/errorHandler');
const { route } = require('./routes/router');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(route);

app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    connectToDatabase();
});
