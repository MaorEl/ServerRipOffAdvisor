var express = require('express');
var app = express();
const DButilsAzure = require('./DButils');
app.use(express.json()); //hels me read the JSON
const jwt = require("jsonwebtoken");

secret = "secret";
app.use("/private", (req, res,next) => {
    const token = req.header("x-auth-token");
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

app.get('/getAllCategories', function (req, res) {
    DButilsAzure.executeQuery('SELECT * FROM Categories')
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err)
            res.send(err)
        })
});


//get all question
app.get('/private/getAllQuestions', function (req, res) {
    DButilsAzure.executeQuery('SELECT * FROM Questions')
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err);
            res.send(err)
        })
});

//get all countries
app.get('/private/getAllCountries', function (req, res) {
    DButilsAzure.executeQuery('SELECT DISTINCT name FROM Country')
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err);
            res.send(err)
        })
});

//get all favorites of username
app.get('/private/getAllFavorites', function (req, res) {
    var token_username = req.username;
    var query = 'SELECT * FROM InterestPoints JOIN InterestPointsOfUsers ON [id] = [interest point id] WHERE username = '.concat("'", token_username, "' ORDER BY i DESC");
    DButilsAzure.executeQuery(query)
        .then(function (result) {
            res.send(result)
        })
        .catch(function (err) {
            console.log(err);
            res.send(err)
        })
});


//get 3 random over a specific rank
app.get('/private/getThreeRandom/:rank', function (req, res) {
    var float = req.params["rank"];
    DButilsAzure.executeQuery('SELECT TOP 3 * FROM InterestPoints WHERE rank >= '.concat(float).concat('ORDER BY newid()'))
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err);
            res.send(err)
        })
});

//get last two reviews of interest point
app.get('/getLastTwoReviews/:InterestPointID', function (req, res) {
    var ip_id = req.params["InterestPointID"];
    var query = 'SELECT TOP 2 * FROM Reviews WHERE [interest point id] = '.concat(ip_id, " ORDER BY addedOn DESC");
    DButilsAzure.executeQuery(query)
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err);
            res.send(err)
        })
});

//get last two reviews of interest point
app.put('/viewInterestPoint/:InterestPointID', function (req, res) {
    var ip_id = req.params["InterestPointID"];
    var query = "UPDATE [dbo].[InterestPoints] \n" +
                "SET [views] = ((SELECT [views] FROM [dbo].[InterestPoints] WHERE [id] = " +ip_id +")) + 1 \n" +
                "WHERE [id] = " +ip_id ;
    DButilsAzure.executeQuery(query)
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err);
            res.send(err)
        })
});

//get 2 popular interest points of user
app.get('/private/getTwoPopularInterestPoints', function (req, res) {
    //var query = "SELECT I.* FROM InterestPoints I JOIN InterestPointsOfUsers U ON [id] = [interest point id] WHERE InterestPoints.rank>3.5 AND username = ".concat("'",req.username,"'");
    let query = "SELECT TOP 2 I.* \n" +
                "FROM [dbo].[InterestPoints] I INNER JOIN [dbo].[CategoriesOfUsers] U \n" +
                "ON I.[category id] = U.[category_id] \n" +
                "WHERE U.[username] LIKE '" + req.username + "' \n" +
                "ORDER BY I.[rank] DESC";
    DButilsAzure.executeQuery(query)
        .then(function(result){
            console.log("return 2 popular interest points by user preferences");
            res.send(result);
        })
        .catch(function(err){
            console.log(err);
            res.send(err)
        })
});




//get last 2 interest points
app.get('/private/getLastTwoSavedInterestPoints', function (req, res) {
    //var query = "SELECT TOP 2 name,[category id], InterestPointsOfUsers.i FROM InterestPoints JOIN InterestPointsOfUsers ON [id] = [interest point id] WHERE username = ".concat("'",req.username,"'".concat("ORDER BY i DESC"));
    let query = "SELECT TOP 2 I.* \n" +
                "FROM [dbo].[InterestPoints] I INNER JOIN [dbo].[InterestPointsOfUsers] U \n" +
                "ON I.[id] = U.[interest point id] \n" +
                "WHERE U.[username] LIKE '" + req.username + "' \n" +
                "ORDER BY U.[addedOn] DESC";

    DButilsAzure.executeQuery(query)
        .then(function(result){
            res.send(result);
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
        email: req.body.email,
        categories: req.body.categories
    };

    if (user.username.length<3 || user.username.length>8) {
        res.status(400).send('Problem with username length!');
    }
    if (user.password.length<5 || user.password.length>10){
        res.statusCode = 400;
        res.send("Problem with password length!");
    }
    if(!(/^[a-zA-Z]+$/.test(user.username))) {
        res.statusCode = 400;
        res.send("Problem with username, only letters allowed!");
    }
    if(!(user.password.match("^[A-z0-9]+$"))) {
        res.statusCode = 400;
        res.send("Problem with password, only letters and digits are allowed!");
    }
    var categoriesArray = user.categories.split(',');
    if (categoriesArray.length < 2){
        res.statusCode = 400;
        res.send("Not enough categories specified !");
    }
    var categoriesIntList = [];
    categoriesArray.forEach(function(value){
        if (!isNaN(parseInt (value)))
            categoriesIntList.push(parseInt (value));
        else {
            res.statusCode = 400;
            res.send("Category must be ID !");
        }
    });

    console.log("got this user: " + req.body.first_name);
    DButilsAzure.executeQuery("INSERT INTO Users (username,password,first_name,last_name,city,country,email) \n" +
                                    "VALUES ('"+user.username + "','"+user.password + "','"+user.first_name+ "','"+user.last_name+ "','"+user.city+ "','"+user.country+ "','"+user.email +"')")
        .then(function(result){
            categoriesIntList.forEach(function (category) {
                DButilsAzure.executeQuery("INSERT INTO [CategoriesOfUsers] (username, category_id) \n" +
                    "VALUES ('" + user.username + "','" + category +"')")
                    .catch(function(err){
                        console.log(err);
                        res.send(err)
                    })
            });

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
    DButilsAzure.executeQuery("SELECT * FROM Users \n" +
        "WHERE [username] LIKE '" + user.username + "' AND [password] LIKE '" + user.password + "'")
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
    var query = 'SELECT * FROM InterestPoints WHERE name LIKE '.concat("'%", string).concat("%'");
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
    var query = 'SELECT * FROM InterestPoints WHERE [category id] = '.concat(string);
    DButilsAzure.executeQuery(query)
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err);
            res.send(err)
        })
});

//get one interst point by id (search)
app.get('/getIntertestPointDetails/:interestPointID', function (req, res) {
    var string = req.params["interestPointID"];
    var query = 'SELECT * FROM InterestPoints WHERE [id] = '.concat(string);
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
    DButilsAzure.executeQuery("INSERT INTO UsersAnswers (username,question_id,answer) VALUES ('"+user.username+"','" +user.question + "','" + user.answer +"')")
        .then(function(result){
            console.log("got new answer of " + user.username);
            res.status(201).send(result)
        })
        .catch(function(err){
            console.log(err);
            res.send(err)
        })
});

//set interst point index to sort it
//will get JSON of JSONS({"interestPointID", "i"})

app.put('/private/updateSortOption', function (req, res) {
    var ip_id, i;
    var username =  req.username;
    for (var key in req.body) {
        ip_id = req.body[key]["interestPointID"];
        i = req.body[key]['i'];
        var query = 'UPDATE InterestPointsOfUsers SET i = '.concat(i, " WHERE [username] = '",username,"' AND [interest point id] = ",ip_id);
        DButilsAzure.executeQuery(query)
            .then(function(result){
                res.send(result)
            })
            .catch(function(err){
                console.log("failed to update in updateSortOption");
                console.log(err);
                res.send(err)
            })
    }

});


//add interest point to favorites. get param of ip_id
app.post('/private/addToFavorites', function (req, res) {

    var InterestPointID =  req.query.ip_id;
    var i = 1;

    var query = "SELECT i FROM InterestPointsOfUsers WHERE i=(SELECT max(i) FROM InterestPointsOfUsers WHERE [username] = '".concat(req.username,"') " +
        "AND [username] = '",req.username,"'");
    DButilsAzure.executeQuery(query).then(function(result) {
        var x = result;
        for (var key in result[0]) {
            i = result[0][key] +1;
        }

        //var query = 'INSERT INTO InterestPointsOfUsers VALUES ('.concat("'",req.username,"' ,",InterestPointID,",",i,")");
        var query = 'INSERT INTO InterestPointsOfUsers (username, [interest point id], i) VALUES ('.concat("'",req.username,"' ,",InterestPointID,",",i,")");
        DButilsAzure.executeQuery(query)
            .then(function(result){
                res.send(result)
            })
            .catch(function(err){
                console.log(err);
                res.send(err)
            })
    }).catch(function(err){
        console.log(err);
        res.send(err)
    })


});

//rank interest point by user
app.post('/private/rankInterestPoint', function (req, res) {

    var max = 1;
    var query = 'SELECT id FROM Reviews WHERE id=(SELECT max(id) FROM Reviews)';
    var max_result = null;
    DButilsAzure.executeQuery(query)
        .then(function(result){
            max_result = result;
            max = max_result[0].id + 1;
            req.body.description = req.body.description.replace("'","''");
            var check_query = "IF NOT EXISTS (SELECT * FROM Reviews WHERE [username] = '".concat(req.username,"' and [interest point id] = ",req.body.interestPointID,") BEGIN ");
            query = check_query.concat('INSERT INTO Reviews (id, username, review, rating, [interest point id]) VALUES ('.concat(max,", '",req.username,"' ,'",req.body.description,"',",req.body.rank,",", req.body.interestPointID,')')," END;");
            DButilsAzure.executeQuery(query)
                .then(function(result){
                    res.send(result);

                    var sum = 0;
                    var count = 0;


                    var count_query = 'SELECT COUNT(*) FROM Reviews WHERE [interest point id] = '.concat("'",req.body.interestPointID,"'");
                    DButilsAzure.executeQuery(count_query)
                        .then(function(result){
                            for (var key in result[0]) {
                                count = result[0][key];
                            }
                            var sum_query = 'SELECT SUM(rating) FROM Reviews WHERE [interest point id] = '.concat("'",req.body.interestPointID,"'");
                            DButilsAzure.executeQuery(sum_query)
                                .then(function(result){
                                    for (var key in result[0]) {
                                        sum = result[0][key];
                                    }                                    var new_rank = sum / count;
                                    var update_rating_query = 'UPDATE InterestPoints SET rank = '.concat(new_rank," WHERE id = ",req.body.interestPointID);
                                    DButilsAzure.executeQuery(update_rating_query)
                                        .then(function(result){
                                        })
                                        .catch(function(err){
                                            console.log("line 305");
                                            console.log(err);
                                            res.send(err)
                                        })
                                })
                                .catch(function(err){
                                    console.log("line 292");

                                    console.log(err);

                                    res.send(err)
                                });

                        })
                        .catch(function(err){
                            console.log("line 281");
                            console.log(err);
                            res.send(err)
                        });

                })
                .catch(function(err){
                    console.log("line 267");
                    console.log(err);
                    res.send(err)
                });

        })
        .catch(function(err){
            console.log(err);
            res.send(err)
        });




});

//add interst point to favorites. get param of ip_id
app.delete('/private/deleteFromFavorites', function (req, res) {

    var InterestPointID = req.query.ip_id;

    var start_of_query = 'DELETE FROM InterestPointsOfUsers WHERE [username] = ';
    var query = start_of_query.concat("'", req.username, "' AND [interest point id] = ", InterestPointID, "");
    DButilsAzure.executeQuery(query)
        .then(function (result) {
            res.send(result)
        })
        .catch(function (err) {
            console.log(err);
            res.send(err)
        })
});



app.post("/RestorePassword", (req , res) => {
    const user = {
        username: req.body.username,
        question: req.body.question,
        answer: req.body.answer
    };
    console.log("got this user: " + req.body.username);
    DButilsAzure.executeQuery("SELECT * FROM UsersAnswers \n" +
        "WHERE [username] LIKE '" +user.username + "' AND [question_id] LIKE '" +user.question + "' AND [answer] LIKE '" +user.answer+"'")
        .then(function(result){
            if (result.length === 1){
                DButilsAzure.executeQuery("SELECT [password] FROM Users WHERE [username] LIKE '" +user.username + "'")
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



