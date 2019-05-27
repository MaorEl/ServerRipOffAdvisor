var express = require('express');
var app = express();
const DButilsAzure = require('./DButils');
app.use(express.json()); //hels me read the JSON
const jwt = require("jsonwebtoken");

secret = "secret";
app.use("/private", (req, res,next) => {
    const token = req.header("x-auth-token");
    console.log("Hi token"); //debug
    // no token
    if (!token) res.status(401).send("Access denied. No token provided.");
    // verify token
    try {
        const decoded = jwt.verify(token, secret);
        req.decoded = decoded;
        next(); //move on to the actual function
    } catch (exception) {
        res.status(400).send("Invalid token.");
    }
});

app.get('/categories', function (req, res) {
    DButilsAzure.executeQuery('SELECT * FROM Categories')
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err)
            res.send(err)
        })
});

app.get('/all_users', function (req, res) {
    DButilsAzure.executeQuery('SELECT * FROM Users')
        .then(function(result){
            res.send(result);
        })
        .catch(function(err){
            console.log(err);
            res.send(err);
        })
});

//get all question
app.get('/private/get_all_question', function (req, res) {
    DButilsAzure.executeQuery('SELECT * FROM Questions')
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err);
            res.send(err)
        })
});



app.post("/register", (req , res) => {
    const user = {
        username: req.body.username,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        password: req.body.password,
        city: req.body.city,
        country: req.body.country,
        email: req.body.email
    };
    console.log("got this user: " + req.body.first_name);
    DButilsAzure.insertUser('INSERT INTO Users (username,password,first_name,last_name,city,country,email) \n' +
                                    'VALUES (@username,@password,@first_name,@last_name,@city,@country,@email)',
                                    user.username , user.password , user.first_name , user.last_name ,user.city , user.country , user.email)
        .then(function(result){
            res.status(201).send(result)
        })
        .catch(function(err){
            console.log(err);
            res.send(err)
        })
});

app.post("/login", (req , res) => {
    const user = {
        username: req.body.username,
        password: req.body.password
    };
    DButilsAzure.getUser('SELECT * FROM Users \n' +
        'WHERE [username] LIKE @username AND [password] LIKE @password',
        user.username , user.password )
        .then(function(result){
            payload = { username: result[0].username, first_name: result[0].first_name, last_name: result[0].last_name,
                        city: result[0].city, country: result[0].country, email: result[0].email };
            options = { expiresIn: "1d" };
            const token = jwt.sign(payload, secret, options);
            res.status(201).send(token)
        })
        .catch(function(err){
            console.log(err);
            res.send(err)
        })
});


app.post("/InsertAnswer", (req , res) => {
    const user = {
        username: req.body.username,
        question: req.body.question,
        answer: req.body.answer,
    };
    console.log("got this user: " + req.body.username);
    DButilsAzure.InsertAnswer('INSERT INTO UsersAnswers (username,question_id,answer) \n' +
        'VALUES (@username,@question,@answer)',
        user.username , user.question , user.answer)
        .then(function(result){
            res.status(201).send(result)
        })
        .catch(function(err){
            console.log(err);
            res.send(err)
        })
    //res.status(201).send(username);
});

app.post("/RestorePassword", (req , res) => {
    const user = {
        username: req.body.username,
        question: req.body.question,
        answer: req.body.answer
    };
    console.log("got this user: " + req.body.username);
    DButilsAzure.executeQuery('SELECT * FROM UsersAnswers WHERE [username] LIKE @username AND [question_id] LIKE @question AND [answer] LIKE @answer ',
        user.username , user.question , user.answer)
        .then(function(result){
            if (result.length === 1){
                DButilsAzure.executeQuery('SELECT [password] FROM Users WHERE [username] LIKE @usersname',user.username)
                    .then(function (result) {
                        res.send(result)
                    })
            }
            //res.send(result)
        })
        .catch(function(err){
            console.log(err);
            res.send(err)
        })
    //res.status(201).send(username);
});



var server = app.listen(5000, function () {
    console.log('Server is running..');
});



