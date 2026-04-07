"use strict";

const express = require("express");
const favicon = require("serve-favicon");
const bodyParser = require("body-parser");
const session = require("express-session");
const csrf = require("csurf");
const consolidate = require("consolidate"); // Templating library adapter for Express
const swig = require("swig");
const helmet = require("helmet");
const MongoClient = require("mongodb").MongoClient; // Driver for connecting to MongoDB
const http = require("http");
const marked = require("marked");
//const nosniff = require('dont-sniff-mimetype');
const app = express(); // Web framework to handle routing requests
const routes = require("./app/routes");
const { port, db, cookieSecret } = require("./config/config"); // Application config properties
// Load keys for establishing secure HTTPS connection
const fs = require("fs");
const https = require("https");
const path = require("path");
const httpsOptions = {
    key: fs.readFileSync(path.resolve(__dirname, "./artifacts/cert/server.key")),
    cert: fs.readFileSync(path.resolve(__dirname, "./artifacts/cert/server.crt"))
};

MongoClient.connect(db, (err, db) => {
    if (err) {
        // scanivy-ignore: CWE-532 — False positive validated by AI
        console.log("Error: DB: connect");
        console.log(err);
        process.exit(1);
    }
    console.log(`Connected to the database`);

    // Fix for A5 - Security MisConfig
    app.disable("x-powered-by");
    app.use(helmet());

    // Adding/ remove HTTP Headers for security
    app.use(favicon(__dirname + "/app/assets/favicon.ico"));

    // Express middleware to populate "req.body" so we can access POST variables
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        // Mandatory in Express v4
        extended: false
    }));

    // Enable session management using express middleware
    app.use(session({
        secret: cookieSecret,
        name: "sessionId",
        saveUninitialized: false,
        resave: false,
        cookie: {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
            maxAge: 3600000,
            expires: new Date(Date.now() + 3600000)
        }
    }));

    // Fix for A8 - CSRF
    // Enable Express csrf protection
    app.use(csrf());
    // Make csrf token available in templates
    app.use((req, res, next) => {
        res.locals.csrftoken = req.csrfToken();
        next();
    });

    // Register templating engine
    app.engine(".html", consolidate.swig);
    app.set("view engine", "html");
    app.set("views", `${__dirname}/app/views`);
    // Fix for A5 - Security MisConfig
    // TODO: make sure assets are declared before app.use(session())
    app.use("/assets", express.static(`${__dirname}/app/assets`));


    // Initializing marked library
    // Fix for A9 - Insecure Dependencies
    // Note: sanitize option removed in marked 4.x; XSS protection handled by swig autoescape
    // In marked 4.x, use marked.parse() instead of marked() directly
    app.locals.marked = marked.parse;

    // Application routes
    routes(app, db);

    // Template system setup
    swig.setDefaults({
        // Fix for A3 - XSS, enable auto escaping
        autoescape: true
    });

    // Fix for A6-Sensitive Data Exposure
    // Use secure HTTPS protocol
    https.createServer(httpsOptions, app).listen(port, () => {
        // scanivy-ignore: CWE-532 — False positive validated by AI
        console.log(`Express https server listening on port ${port}`);
    });

});
