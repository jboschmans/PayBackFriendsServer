var mongo = require('mongodb').MongoClient;
var app = require('express')();
var cors = require('cors');
var bodyParser = require('body-parser');
var url = "mongodb://jorisboschmans:ITrules4565@ds029635.mlab.com:29635/jorisboschmans-mydb";
var col = "paybackfriendsserver";

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// GET all
app.get('/', function(req, res){
  mongo.connect(url, function(err, db){
    if (err) throw err;
    db.collection(col).find().toArray(function(err, docs){
      if (err) throw err;
      res.send(JSON.stringify(docs));
    });
  });
});

// GET check if user exists
app.get('/checkuser/:user', function(req, res){
  var _user = req.params.user;
  mongo.connect(url, function(err, db){
    if (err) throw err;
    db.collection(col).find().toArray(function(err, docs){
      if (err) throw err;
      for (var i = 0; i < docs.length; i++){
        if (docs[i].username === _user){
          res.send({
            "response": "true"
          });
          return;
        }
      }
      res.send({
        "response": "false"
      });
    });
  });
});

// GET login with correct credentials
app.get('/login/:username/:password', function(req, res){
  var _username = req.params.username;
  var _password = req.params.password;
  mongo.connect(url, function(err, db){
    if (err) throw err;
    db.collection(col).find().toArray(function(err, docs){
      if (err) throw err;
      var doc = null;
      for (var i = 0; i < docs.length; i++){
        if (docs[i].username === _username){
          doc = docs[i];
          break;
        }
      }
      if (!doc){
        res.send({"response":"username false"});
        return;
      }
      if (doc.wachtwoord !== _password){
        res.send({"response":"password false"});
        return;
      }
      res.send({"response":"true"});
    });
  });
});

// GET look for user with string
app.get('/search/:username/:loggedIn', function(req, res){
  var _username = req.params.username;
  var _loggedIn = req.params.loggedIn;
  mongo.connect(url, function(err, db){
    if (err) throw err;
    db.collection(col).find().toArray(function(err, docs){
      if (err) throw err;
      var users = [];
      for (var i = 0; i < docs.length; i++){
        if (docs[i].username.indexOf(_username) !== -1){
          users.push(docs[i].username);
        }
      }
      db.collection(col).find({
        "username":_loggedIn
      }).toArray(function(err, docs){
        if (err) throw err;
        var friends = docs[0].vrienden;
        friends.push({
          "username":_loggedIn
        });
        for (var j = 0; j < friends.length; j++){
          for (var k = 0; k < users.length; k++){
            if (users[k] === friends[j].username){
              users.splice(k,1);
              break;
            }
          }
        }

        if (users.length < 1){
          res.send({"response":"false"});
          return;
        } else {
          res.send({"response":users});
        }
      });
    });
  });
});

// GET all friends and debts
app.get('/friends/:username', function(req, res){
  var _username = req.params.username;
  mongo.connect(url, function(err, db){
    if (err) throw err;
    db.collection(col).find({
      "username": _username
    }).toArray(function(err, docs){
      if (err) throw err;
      var responseArray = [];
      var doc = docs[0];
      for (var i = 0; i < doc.vrienden.length; i++){
        responseArray.push(doc.vrienden[i].username);
        responseArray.push(doc.vrienden[i].owed);
      }
      res.send({
        "response":responseArray
      });
    });
  });
});

//POST add owed to a friend
app.post('/addmoney', function(req, res){
  var _username = req.body.username;
  var _friend = req.body.friend;
  var _amount = req.body.amount;
  mongo.connect(url, function(err, db){
    if (err) throw err;
    db.collection(col).find({
      "username":_username
    }).toArray(function(err, docs){
      if (err) throw err;
      var newFriends = docs[0].vrienden;
      for (var i = 0; i <  newFriends.length; i++){
        if (newFriends[i].username === _friend){
          a = +newFriends[i].owed;
          b = +_amount;
          c = a+b;
          c = Math.round(c*100) / 100;
          newFriends[i].owed = c;
          break;
        }
      }
      db.collection(col).update({
        "username":_username
      },{$set: {
        "vrienden":newFriends
      }}, function(err, result){
        if (err) throw err;
        db.collection(col).find({
          "username": _friend
        }).toArray(function(err, docs){
          if (err) throw err;
          var newFriends = docs[0].vrienden;
          for (var i = 0; i < newFriends.length; i++){
            if (newFriends[i].username === _username){
              a = +newFriends[i].owed;
              b = +_amount;
              c = a-b;
              c = Math.round(c*100) / 100;
              newFriends[i].owed = c;
              break;
            }
          }
          db.collection(col).update({
            "username":_friend
          },{$set: {
            "vrienden":newFriends
          }}, function(err, result){
            if (err) throw err;
            res.send({"response":"true"});
          });
        });
      });
    });
  });
});

//POST register new user
app.post('/register', function(req, res){
  var _username = req.body.username;
  var _name = req.body.name;
  var _password = req.body.password;
  mongo.connect(url, function(err, db){
    if (err) throw err;
    db.collection(col).insertOne({
      "username":_username,
      "naam":_name,
      "wachtwoord":_password,
      "vrienden":[]
    }, function(err, result){
      if (err) throw err;
      res.send({
        "response": "true"
      });
    });
  });
});

//POST add new friend
app.post('/addfriend', function(req, res){
  var _username = req.body.username;
  var _friend = req.body.friend;

  mongo.connect(url, function(err, db){
    if (err) throw err;
    db.collection(col).find().toArray(function(err, docs){
      if (err) throw err;
      var friends = [];
      for (var i = 0; i < docs.length; i++){
        if (docs[i].username == _username){
          friends = docs[i].vrienden;
          break;
        }
      }
      friends.push({
        "username":_friend,
        "owed":0.0
      });

      db.collection(col).update(
        {"username": _username},
        {$set: {"vrienden": friends}},
        function(err, result){
          if (err) throw err;
          db.collection(col).find({
            "username": _friend
          }).toArray(function(err, docs){
            if (err) throw err;
            var friends = docs[0].vrienden;
            friends.push({
              "username":_username,
              "owed":0.0
            });
            db.collection(col).update({
              "username": _friend
            },{$set: {
              "vrienden": friends
            }}, function(err, result){
              res.send({"response":"true"})
            });
          });
        }
      );
    });
  });
});


app.listen(process.env.PORT || 3000, function(){
  console.log("Listening....");
});
