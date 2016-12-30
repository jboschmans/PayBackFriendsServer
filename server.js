var mongo = require('mongodb').MongoClient;
var app = require('express')();
var cors = require('cors');
var bodyParser = require('body-parser');
var url = "mongodb://jorisboschmans:ITrules4565@ds029635.mlab.com:29635/jorisboschmans-mydb";
var col = "paybackfriendsserver";

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res){
  mongo.connect(url, function(err, db){
    if (err) throw err;
    db.collection(col).find().toArray(function(err, docs){
      if (err) throw err;
      res.send(JSON.stringify(docs));
    });
  });
});

app.get('/checkuser/:user', function(req, res){
  var _user = req.params.user;
  mongo.connect(url, function(err, db){
    if (err) throw err;
    db.collection(col).find().toArray(function(err, docs){
      if (err) throw err;
      for (var i = 0; i < docs.length; i++){
        if (docs[i].username === _user){
          res.send("true");
          return;
        }
      }
      res.send("false");
    });
  });
});

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
        res.send("username false");
        return;
      }
      if (doc.wachtwoord !== _password){
        res.send("password false");
        return;
      }
      res.send("true");
    });
  });
});

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
      res.send(true);
    });
  });
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Listening....");
});
