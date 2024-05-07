const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");

const clientes = require("./Routes/clientes.route");
const app = express();
const dotenv = require("dotenv");

dotenv.config();

// Settings
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors())

app.use(express.static(__dirname + "/uploads"));


// Routes
app.use("/admin/clientes", clientes);





module.exports = app;
