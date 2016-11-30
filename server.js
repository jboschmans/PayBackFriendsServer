var app = require('express')();

app.get('/', function(req, res){
  res.send("Hello world");
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Listening....");
});
