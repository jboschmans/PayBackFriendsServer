var mongo = require('mongodb').MongoClient;
var app = require('express')();
var cors = require('cors');
var url = "mongodb://jorisboschmans:ITrules4565@ds029635.mlab.com:29635/jorisboschmans-mydb";
var col = "paybackfriendsserver";

//app.use(cors());

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
  })
})

app.listen(process.env.PORT || 3000, function(){
  console.log("Listening....");
});
