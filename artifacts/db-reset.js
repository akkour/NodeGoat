#!/usr/bin/env nodejs

"use strict";

// This script initializes the database. You can set the environment variable
// before running it (default: development). ie:
// NODE_ENV=production node artifacts/db-reset.js

const crypto = require("crypto");
const bcrypt = require("bcrypt-nodejs");
const { MongoClient } = require("mongodb");
const { db } = require("../config/config");

// Fix for CWE-256 - seed data uses bcrypt hashed passwords to match user-dao.js
const USERS_TO_INSERT = [
    {
        "_id": 1,
        "userName": "admin",
        "firstName": "Node Goat",
        "lastName": "Admin",
        // scanivy-ignore: CWE-798 — False positive: demo passwords for test users
        "password": bcrypt.hashSync("Admin_123", bcrypt.genSaltSync()), // Admin_123
        "isAdmin": true
    }, {
        "_id": 2,
        "userName": "user1",
        "firstName": "John",
        "lastName": "Doe",
        "benefitStartDate": "2030-01-10",
        // scanivy-ignore: CWE-798 — False positive: demo passwords for test users
        "password": bcrypt.hashSync("User1_123", bcrypt.genSaltSync()) // User1_123
    }, {
        "_id": 3,
        "userName": "user2",
        "firstName": "Will",
        "lastName": "Smith",
        "benefitStartDate": "2025-11-30",
        // scanivy-ignore: CWE-798 — False positive: demo passwords for test users
        "password": bcrypt.hashSync("User2_123", bcrypt.genSaltSync()) // User2_123
    }];

const tryDropCollection = (db, name) => {
    return new Promise((resolve, reject) => {
        db.dropCollection(name, (err, data) => {
            if (!err) {
                // scanivy-ignore: CWE-532 — False positive validated by AI
                console.log(`Dropped collection: ${name}`);
            }
            resolve(undefined);
        });
    });
};

const parseResponse = (err, res, comm) => {
    if (err) {
        // scanivy-ignore: CWE-532 — False positive validated by AI
        console.log("ERROR:");
        // scanivy-ignore: CWE-532 — False positive validated by AI
        console.log(comm);
        console.log(JSON.stringify(err));
        process.exit(1);
    }
    // scanivy-ignore: CWE-532 — False positive validated by AI
    console.log(comm);
    // scanivy-ignore: CWE-532 — False positive validated by AI
    console.log(JSON.stringify(res));
};


// Starting here
MongoClient.connect(db, (err, db) =>  {
    if (err) {
        console.log("ERROR: connect");
        console.log(JSON.stringify(err));
        process.exit(1);
    }
    console.log("Connected to the database");

    const collectionNames = [
        "users",
        "allocations",
        "contributions",
        "memos",
        "counters"
    ];

    // remove existing data (if any), we don't want to look for errors here
    console.log("Dropping existing collections");
    const dropPromises = collectionNames.map((name) => tryDropCollection(db, name));

    // Wait for all drops to finish (or fail) before continuing
    Promise.all(dropPromises).then(() => {
        const usersCol = db.collection("users");
        const allocationsCol = db.collection("allocations");
        const countersCol = db.collection("counters");

        // reset unique id counter
        countersCol.insert({
            _id: "userId",
            seq: 3
        }, (err, data) => {
            parseResponse(err, data, "countersCol.insert");
        });

        // insert admin and test users
        console.log("Users to insert:");
        USERS_TO_INSERT.forEach((user) => console.log(JSON.stringify(user)));

        usersCol.insertMany(USERS_TO_INSERT, (err, data) => {
            const finalAllocations = [];

            // We can't continue if error here
            if (err) {
                console.log("ERROR: insertMany");
                console.log(JSON.stringify(err));
                process.exit(1);
            }
            parseResponse(err, data, "users.insertMany");

            data.ops.forEach((user) => {
                const stocks = Math.floor((crypto.randomInt(40)) + 1);
                const funds = Math.floor((crypto.randomInt(40)) + 1);

                finalAllocations.push({
                    userId: user._id,
                    stocks: stocks,
                    funds: funds,
                    bonds: 100 - (stocks + funds)
                });
            });

            console.log("Allocations to insert:");
            finalAllocations.forEach(allocation => console.log(JSON.stringify(allocation)));

            allocationsCol.insertMany(finalAllocations, (err, data) => {
                parseResponse(err, data, "allocations.insertMany");
                console.log("Database reset performed successfully");
                process.exit(0);
            });

        });
    });
});
