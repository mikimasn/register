var port = process.env.PORT || 8000;
var express=require('express');
var app = express();
app.get('/',(req,res)=>{
    res.send("witaj");
});
app.listen(port).then(()=>{
    console.log("Listening: "+port);
})