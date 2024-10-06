const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userController = require("./controllers/userController");
const transactionController = require("./controllers/transactionController");
const https = require("https");
const fs = require("fs");
const { resolve } = require("path");
const { config } = require("dotenv");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const xssClean = require('xss-clean');
const { lightbruteforce } = require("./clients/BruteClient");


config();

const options = {
  key: fs.readFileSync(resolve(__dirname, "../keys/privatekey.pem")),
  cert: fs.readFileSync(resolve(__dirname, "../keys/certificate.pem"))
};

const port = process.env.PORT || 3001;
const app = express();

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use(cors({origin: 'http://localhost:5173'})); //Save
app.use(express.json());


app.use(cookieParser()); // Secure cookies
app.use(xssClean());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // Prevent client-side JS from accessing the cookie
      secure: process.env.NODE_ENV === 'production', // True in production
      sameSite: 'strict', // Prevent cross-site request forgery
    },
  })
);

app.use(lightbruteforce.prevent); // Prevents DDos 

app.use("/api/user", userController);
app.use("/api/transaction", transactionController);

let server = https.createServer(options, app)
console.log("Server listing on: https://localhost:" + port);
server.listen(port)