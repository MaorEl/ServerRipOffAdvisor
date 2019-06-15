const DButilsAzure = require('./DButils');

function getAllInterestPointsByCategory(req, res) {
    var string = req.params["categoryID"];
    var query = 'SELECT * FROM InterestPoints WHERE [category id] = '.concat(string);
    DButilsAzure.executeQuery(query)
        .then(function (result) {
            res.send(result)
        })
        .catch(function (err) {
            console.log(err);
            res.send(err)
        })
}

function getAllInterestPointsByCategorySortedByRank(req, res) {
    var string = req.params["categoryID"];
    var query = 'SELECT * FROM InterestPoints WHERE [category id] = '.concat(string, ' ORDER by RANK DESC');
    DButilsAzure.executeQuery(query)
        .then(function (result) {
            res.send(result)
        })
        .catch(function (err) {
            console.log(err);
            res.send(err)
        })
}

function getLastTwoReviews(req, res) {
    var ip_id = req.params["InterestPointID"];
    var query = 'SELECT TOP 2 * FROM Reviews WHERE [interest point id] = '.concat(ip_id, " ORDER BY addedOn DESC");
    DButilsAzure.executeQuery(query)
        .then(function (result) {
            res.send(result)
        })
        .catch(function (err) {
            console.log(err);
            res.send(err)
        })
}

function getTwoPopularInterestPoints(req, res) {
    //var query = "SELECT I.* FROM InterestPoints I JOIN InterestPointsOfUsers U ON [id] = [interest point id] WHERE InterestPoints.rank>3.5 AND username = ".concat("'",req.username,"'");
    let query = "IF OBJECT_ID('tempdb.dbo.#TMP', 'U') IS NOT NULL\n" +
        "\t\tDROP TABLE #TMP;\n" +
        "\n" +
        "\tSELECT DISTINCT [category id]\n" +
        "\tINTO #TMP\n" +
        "\tFROM [dbo].[InterestPoints] I INNER JOIN [dbo].[CategoriesOfUsers] U\n" +
        "\t\tON I.[category id] = U.[category_id]\n" +
        "\tWHERE U.username LIKE '" + req.username + "'\n" +
        "\n" +
        "\n" +
        "\tDECLARE @CAT AS INT\n" +
        "\tDECLARE @MAX AS INT = 0\n" +
        "\n" +
        "\tIF OBJECT_ID('tempdb.dbo.#TMP_INTERERSTPOINTS_MAX', 'U') IS NOT NULL\n" +
        "\t\tDROP TABLE #TMP_INTERERSTPOINTS_MAX;\n" +
        "\n" +
        "\tSELECT TOP 0 *\n" +
        "\tINTO #TMP_INTERERSTPOINTS_MAX\n" +
        "\tFROM [dbo].[InterestPoints]\n" +
        "\n" +
        "\tDECLARE db_cursor CURSOR FOR\tSELECT [category id] \n" +
        "\t\t\t\t\t\t\t\t\tFROM #TMP\n" +
        "\tOPEN db_cursor  \n" +
        "\tFETCH NEXT FROM db_cursor INTO @CAT  \n" +
        "\tWHILE @@FETCH_STATUS = 0  \n" +
        "\tBEGIN  \n" +
        "\t\t  \n" +
        "\t\t  SET @MAX = ((\tSELECT MAX([rank])\n" +
        "\t\t\t\t\t\tFROM [dbo].[InterestPoints] ))\n" +
        "\n" +
        "\t\t  INSERT INTO #TMP_INTERERSTPOINTS_MAX\n" +
        "\t\t  SELECT TOP 1 *\n" +
        "\t\t  FROM [dbo].[InterestPoints]\n" +
        "\t\t  WHERE [category id] = @CAT AND [RANK] = @MAX\n" +
        "\n" +
        "\t\t  FETCH NEXT FROM db_cursor INTO @CAT \n" +
        "\tEND \n" +
        "\n" +
        "\tCLOSE db_cursor  \n" +
        "\tDEALLOCATE db_cursor \n" +
        "\n" +
        "\tSELECT * FROM #TMP_INTERERSTPOINTS_MAX";
    DButilsAzure.executeQuery(query)
        .then(function (result) {
            console.log("return 2 popular interest points by user preferences");
            res.send(result);
        })
        .catch(function (err) {
            console.log(err);
            res.send(err)
        })
}

function getLastTwoSavedInterestPoints(req, res) {
    //var query = "SELECT TOP 2 name,[category id], InterestPointsOfUsers.i FROM InterestPoints JOIN InterestPointsOfUsers ON [id] = [interest point id] WHERE username = ".concat("'",req.username,"'".concat("ORDER BY i DESC"));
    let query = "SELECT TOP 2 I.* \n" +
        "FROM [dbo].[InterestPoints] I INNER JOIN [dbo].[InterestPointsOfUsers] U \n" +
        "ON I.[id] = U.[interest point id] \n" +
        "WHERE U.[username] LIKE '" + req.username + "' \n" +
        "ORDER BY U.[addedOn] DESC";

    DButilsAzure.executeQuery(query)
        .then(function (result) {
            res.send(result);
        })
        .catch(function (err) {
            console.log(err);
            res.send(err)
        })
}

function getAllInterestPoints(req, res) {
    DButilsAzure.executeQuery('SELECT * FROM InterestPoints')
        .then(function (result) {
            res.send(result)
        })
        .catch(function (err) {
            console.log(err);
            res.send(err)
        })
}

function getIntertestPointDetails(req, res) {
    var string = req.params["interestPointID"];
    var query = 'SELECT * FROM InterestPoints WHERE [id] = '.concat(string);
    DButilsAzure.executeQuery(query)
        .then(function (result) {
            res.send(result)
        })
        .catch(function (err) {
            console.log(err);
            res.send(err)
        })
}

function viewInterestPoint(req, res) {
    var ip_id = req.params["InterestPointID"];
    var query = "UPDATE [dbo].[InterestPoints] \n" +
        "SET [views] = ((SELECT [views] FROM [dbo].[InterestPoints] WHERE [id] = " + ip_id + ")) + 1 \n" +
        "WHERE [id] = " + ip_id;
    DButilsAzure.executeQuery(query)
        .then(function (result) {
            res.send(result)
        })
        .catch(function (err) {
            console.log(err);
            res.send(err)
        })
}

function addToFavorites(req, res) {

    var InterestPointID = req.query.ip_id;
    var i = 1;

    var query = "SELECT i FROM InterestPointsOfUsers WHERE i=(SELECT max(i) FROM InterestPointsOfUsers WHERE [username] = '".concat(req.username, "') " +
        "AND [username] = '", req.username, "'");
    DButilsAzure.executeQuery(query).then(function (result) {
        var x = result;
        for (var key in result[0]) {
            i = result[0][key] + 1;
        }

        //var query = 'INSERT INTO InterestPointsOfUsers VALUES ('.concat("'",req.username,"' ,",InterestPointID,",",i,")");
        var query = 'INSERT INTO InterestPointsOfUsers (username, [interest point id], i) VALUES ('.concat("'", req.username, "' ,", InterestPointID, ",", i, ")");
        DButilsAzure.executeQuery(query)
            .then(function (result) {
                res.send(result)
            })
            .catch(function (err) {
                console.log(err);
                res.send(err)
            })
    }).catch(function (err) {
        console.log(err);
        res.send(err)
    })


}

function rankInterestPoint(req, res) {

    var max = 1;
    var query = 'SELECT id FROM Reviews WHERE id=(SELECT max(id) FROM Reviews)';
    var max_result = null;
    DButilsAzure.executeQuery(query)
        .then(function (result) {
            max_result = result;
            max = max_result[0].id + 1;
            req.body.description = req.body.description.replace("'", "''");
            var check_query = "";
            query = check_query.concat('INSERT INTO Reviews (id, username, review, rating, [interest point id]) VALUES ('.concat(max, ", '", req.username, "' ,'", req.body.description, "',", req.body.rank, ",", req.body.interestPointID, ')'));
            DButilsAzure.executeQuery(query)
                .then(function (result) {
                    res.send(result);

                    var sum = 0;
                    var count = 0;
                    var count_query = 'SELECT COUNT(*) FROM Reviews WHERE [interest point id] = '.concat("'", req.body.interestPointID, "'");
                    DButilsAzure.executeQuery(count_query)
                        .then(function (result) {
                            for (var key in result[0]) {
                                count = result[0][key];
                            }
                            var sum_query = 'SELECT SUM(rating) FROM Reviews WHERE [interest point id] = '.concat("'", req.body.interestPointID, "'");
                            DButilsAzure.executeQuery(sum_query)
                                .then(function (result) {
                                    for (var key in result[0]) {
                                        sum = result[0][key];
                                    }
                                    var new_rank = sum / count;
                                    var update_rating_query = 'UPDATE InterestPoints SET rank = '.concat(new_rank, " WHERE id = ", req.body.interestPointID);
                                    DButilsAzure.executeQuery(update_rating_query)
                                        .then(function (result) {
                                            //todo: wtf is goinf here
                                        })
                                        .catch(function (err) {
                                            console.log("line 305");
                                            console.log(err);
                                            res.send(err)
                                        })
                                })
                                .catch(function (err) {
                                    console.log("line 292");

                                    console.log(err);

                                    res.send(err)
                                });

                        })
                        .catch(function (err) {
                            console.log("line 281");
                            console.log(err);
                            res.send(err)
                        });

                })
                .catch(function (err) {
                    console.log("line 267");
                    console.log(err);
                    res.send(err)
                });

        })
        .catch(function (err) {
            console.log(err);
            res.send(err)
        });


}

function deleteFromFavorites(req, res) {

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
}

function updateSortOption(req, res) {
    var ip_id, i;
    var username = req.username;
    for (var key in req.body) {
        ip_id = req.body[key]["interestPointID"];
        i = req.body[key]['i'];
        var query = 'UPDATE InterestPointsOfUsers SET i = '.concat(i, " WHERE [username] = '", username, "' AND [interest point id] = ", ip_id);
        DButilsAzure.executeQuery(query)
            .then(function (result) {
                res.send(result)
            })
            .catch(function (err) {
                console.log("failed to update in updateSortOption");
                console.log(err);
                res.send(err)
            })
    }

}

function getAllCategories(req, res) {
    DButilsAzure.executeQuery('SELECT * FROM Categories')
        .then(function (result) {
            res.send(result)
        })
        .catch(function (err) {
            console.log(err)
            res.send(err)
        })
}

function getAllFavorites(req, res) {
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
}

function getThreeRandom(req, res) {
    var float = req.params["rank"];
    DButilsAzure.executeQuery('SELECT TOP 3 * FROM InterestPoints WHERE rank >= '.concat(float).concat('ORDER BY newid()'))
        .then(function (result) {
            res.send(result)
        })
        .catch(function (err) {
            console.log(err);
            res.send(err)
        })
}

function searchForInterestPoint(req, res) {
    var string = req.params["name"];
    var query = 'SELECT * FROM InterestPoints WHERE name LIKE '.concat("'%", string).concat("%'");
    DButilsAzure.executeQuery(query)
        .then(function (result) {
            res.send(result)
        })
        .catch(function (err) {
            console.log(err);
            res.send(err)
        })
}

function getTopFivePhotos(req, res) {
    DButilsAzure.executeQuery('SELECT TOP 5 image FROM InterestPoints ORDER BY views DESC')
        .then(function (result) {
            res.send(result)
        })
        .catch(function (err) {
            console.log(err);
            res.send(err)
        })
}


exports.getAllInterestPointsByCategory = getAllInterestPointsByCategory;
exports.getLastTwoReviews = getLastTwoReviews;
exports.getTwoPopularInterestPoints = getTwoPopularInterestPoints;
exports.getLastTwoSavedInterestPoints = getLastTwoSavedInterestPoints;
exports.getAllInterestPoints = getAllInterestPoints;
exports.getIntertestPointDetails = getIntertestPointDetails;
exports.addToFavorites = addToFavorites;
exports.rankInterestPoint = rankInterestPoint;
exports.deleteFromFavorites = deleteFromFavorites;
exports.updateSortOption = updateSortOption;
exports.getAllCategories = getAllCategories;
exports.getAllFavorites = getAllFavorites;
exports.getThreeRandom = getThreeRandom;
exports.searchForInterestPoint = searchForInterestPoint;
exports.getTopFivePhotos = getTopFivePhotos;
exports.viewInterestPoint = viewInterestPoint;
exports.getAllInterestPointsByCategorySortedByRank = getAllInterestPointsByCategorySortedByRank;
