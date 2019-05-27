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
        var userId = decoded.username;
        req.username = userId;
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
app.get('/private/get_all_question', function (req, res, userId) {
    DButilsAzure.executeQuery('SELECT * FROM Questions')
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err);
            res.send(err)
        })
});


//get all favorites of username
app.get('/private/getAllFavorites/:username', function (req, res, userId) {
    var username = req.params["username"];
    var token_username = req.username;
    if (token_username != username) { //checking if the user is the same one
        console.log(err);
        res.send(err);
    }
    else {
        var query = 'SELECT id, name, image FROM InterestPoints JOIN InterestPointsOfUsers ON [id] = [interest point id] WHERE username = '.concat("'",username,"'");
        DButilsAzure.executeQuery(query)
            .then(function(result){
                res.send(result)
            })
            .catch(function(err){
                console.log(err);
                res.send(err)
            })
    }

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

//get all question
app.get('/getAllInterestPoints', function (req, res) {
    DButilsAzure.executeQuery('SELECT * FROM InterestPoints')
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err);
            res.send(err)
        })
});

//get top 5 photos
app.get('/getTopFivePhotos', function (req, res) {
    DButilsAzure.executeQuery('SELECT TOP 5 image FROM InterestPoints ORDER BY views DESC')
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err);
            res.send(err)
        })
});

//get interst points by name (search)
app.get('/searchForInterestPoint/:name', function (req, res) {
    var string = req.params["name"];
    var query = 'SELECT id, name, image FROM InterestPoints WHERE name LIKE '.concat("'%", string).concat("%'");
    DButilsAzure.executeQuery(query)
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err);
            res.send(err)
        })
});

//get all interst points by category (search)
app.get('/getAllInterestPointsByCategory/:categoryID', function (req, res) {
    var string = req.params["categoryID"];
    var query = 'SELECT id, name, image FROM InterestPoints WHERE [category id] = '.concat(string);
    DButilsAzure.executeQuery(query)
        .then(function(result){
            res.send(result)
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


//add interst point to favorites. get param of ip_id
app.post('/private/addToFavorites', function (req, res) {

    var InterestPointID =  req.query.ip_id;


    var query = 'INSERT INTO InterestPointsOfUsers VALUES ('.concat("'",req.username,"' ,",InterestPointID,")");
    DButilsAzure.executeQuery(query)
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err);
            res.send(err)
        })
});

//add interst point to favorites. get param of ip_id
    app.delete('/private/deleteFromFavorites', function (req, res) {

        var InterestPointID =  req.query.ip_id;

        var start_of_query = 'DELETE FROM InterestPointsOfUsers WHERE [username] = ';
        var query = start_of_query.concat("'",req.username,"' AND [interest point id] = ",InterestPointID,"");
        DButilsAzure.executeQuery(query)
            .then(function(result){
                res.send(result)
            })
            .catch(function(err){
                console.log(err);
                res.send(err)
            })
    });





var server = app.listen(5000, function () {
    console.log('Server is running..');
});



