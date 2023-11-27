// imports------------------------------------------------------------
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 4000;

// mongoDB connection---------------------------------------------------
const connectionParams={
    // useNewUrlParser: true,
}
mongoose.connect(process.env.Database_URL ,connectionParams)
    .then( () => {
        console.log('Connected to the database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. n${err}`);
});

// middlewares----------------------------------------------------------
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(session({
    secret: "my secret key",
    saveUninitialized: true,
    resave: false,
}));

// for storing session message
app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

app.use(express.static("uploads"));


// Setting templete engine-------------------------------------------------
app.set('view engine', 'ejs');

// Route prefix
app.use("", require("./routes/router"));

// Running server-------------------------------------------------------
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});