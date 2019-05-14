var express = require('express');
var app = express();
const DButilsAzure = require('./DButils');
app.use(express.json()); //hels me read the JSON


app.get('/all_users', function (req, res) {
    DButilsAzure.executeQuery('SELECT * FROM Users')
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err)
            res.send(err)
        })
});

app.post("/api/new_user", (req , res) => {
    const user = {
        username: req.body.username,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        password: req.body.password,
        city: req.body.city,
        country: req.body.country,
        email: req.body.email,
        questions_answers: req.body.questions_answers,
    };
    console.log("got this user: " + req.body.first_name);
    DButilsAzure.insertQuery('INSERT INTO Users (username,password,first_name,last_name,city,country,email,questions_answers) \n' +
                                    'VALUES (@username,@password,@first_name,@last_name,@city,@country,@email,@questions_answers)',
                                    user.username , user.password , user.first_name , user.last_name ,user.city , user.country , user.email ,user.questions_answers)
        .then(function(result){
            res.status(201).send(result)
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



