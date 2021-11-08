var express=require('express');
var bodyParser = require('body-parser');
var app = express().use(bodyParser.json());
app.get('/',(req,res)=>{
    res.status(200).send('EVENT_RECEIVED');
});
app.get('/login',(req,res)=>{
    
})
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening!'));