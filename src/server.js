const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userController = require("./controllers/userController");
const https = require("https");
const fs = require("fs");
const { resolve } = require("path");
const { config } = require("dotenv");

config();

const options = {
  key: fs.readFileSync(resolve(__dirname, "../keys/privatekey.pem")),
  cert: fs.readFileSync(resolve(__dirname, "../keys/certificate.pem"))
};

const port = process.env.PORT || 2323;
const app = express();

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use(cors({origin: 'http://localhost:3000'}));
app.use(express.json());

app.use("/api/user", userController);

let server = https.createServer(options, app)
console.log("Server listing on: https://localhost:" + port);
server.listen(port)