const express = require('express');
const bodyParser = require('body-parser')
const { ObjectID } = require('mongodb');
const MongoClient = require("mongodb").MongoClient;
var app = express();
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/static', express.static("public"))
require('dotenv').config();
const connectionString = process.env.CONNECTION_STRING;
MongoClient.connect(connectionString, { useUnifiedTopology: true })
    .then((client) => {
        const db = client.db("Aircraft_inventory");
        const inventory = db.collection("Details");
        app.listen(3000, () => { console.log("App is running in port 3000!!") })
        app.get("/", (req, res) => {
            res.render("index.ejs")
        })
        app.post("/login", (req, res) => {
            if (req.body.username == process.env.NAME && req.body.password == process.env.PASSWORD) {
                inventory
                    .find()
                    .toArray()
                    .then((results) => {
                        res.render("homepage.ejs", { content: results });
                    })
                    .catch((error) => console.error(error));
            } else
                res.render("invalid.ejs");
        })
        app.get("/add", (req, res) => {
            res.render("add.ejs");
        })
        app.post("/add", (req, res) => {
            inventory
                .insertOne(req.body)
                .then((result) => {
                    inventory
                        .find()
                        .toArray()
                        .then((results) => {
                            res.render("homepage.ejs", { content: results });
                        })
                        .catch((error) => console.error(error));
                })
                .catch((error) => console.log(error));
        });
        app
            .route("/update/:id")
            .get((req, res) => {
                var id = req.params.id;
                var query = { _id: ObjectID(id) }
                inventory.find(query).toArray(function(err, result) {
                    if (err) throw err;
                    res.render("update.ejs", { content: result });
                });
            })
            .post((req, res) => {
                const id_val = req.params.id;
                const queryvalue = { _id: ObjectID(id_val) };
                const new_val = { $set: { number: req.body.number, fuel: req.body.fuel, route: req.body.route, origin: req.body.origin, destination: req.body.destination, duration: req.body.duration, time: req.body.time } };
                inventory.updateOne(queryvalue, new_val, function(error, res) {})
                inventory
                    .find()
                    .toArray()
                    .then((results) => {
                        res.render("homepage.ejs", { content: results });
                    })
                    .catch((error) => console.error(error));

            });
        app.route("/delete/:id").get((req, res) => {
            const id_val = req.params.id;
            const queryvalue = { _id: ObjectID(id_val) };
            inventory.remove(queryvalue, function(err, obj) {
                if (err) throw err;
                else {
                    inventory
                        .find()
                        .toArray()
                        .then((results) => {
                            res.render("homepage.ejs", { content: results });
                        })
                        .catch((error) => console.error(error));
                }
            });

        });

    }).catch((error) => console.error(error))