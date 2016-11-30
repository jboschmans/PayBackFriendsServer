var mongo = require('mongodb').MongoClient;
var app = require('express')();
var url = "mongodb://jorisboschmans:ITrules4565@ds029635.mlab.com:29635/jorisboschmans-mydb";
var col = "paybackfriendsserver";

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', function(req, res){
  mongo.connect(url, function(err, db){
    if (err) throw err;
    db.collection(col).find().toArray(function(err, docs){
      if (err) throw err;
      res.send(JSON.stringify(docs));
    });
  });
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Listening....");
});
