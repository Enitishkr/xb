var express = require('express');
var app = express();
const mongoose = require('mongoose');
require('dotenv/config');

const PostModel = require('./models/posts');
const bodyParser = require('body-parser');
let port = 8081;
var dataLength;

var data = [    // {
                //     id: 1,
                //     name: "Nitish",
                //     url:"https://www.w3schools.com/images/w3schools_green.jpg",
                //     caption:"This is nitish",
                //     Dtime:'2021/2/5  9:54 am'
                // }
            ];
//middleWare
// Allowing cros
app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-with, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods","POST, GET, PATCH");
    res.setHeader("Set-Cookie", "HttpOnly;Secure;SameSite=Strict");
    next();
});

app.use(bodyParser.urlencoded({
    extended: true
  }));


app.use(bodyParser.json());



// For Getting Latest 100 Memes without Time Parameter
app.get('/memes', async (req, res)=>{
    var DataObjWithoutTime = [];
    try{
        const posts = await PostModel.find().limit(100);
        posts.forEach(da =>{
            var newObj={};
            newObj.id= da.id;
            newObj.name = da.name;
            newObj.url = da.url;
            newObj.caption = da.caption;
            DataObjWithoutTime.unshift(newObj);
        })
        //data = SampleData;
        //console.log(data);
    }
    catch(err){
        console.log(err);
    }
    res.json(DataObjWithoutTime);
});

// With Time Parameter used to disply content in Frontend
app.get('/memes/time', async (req, res)=>{
    var SampleData = [];
    try{
        const posts = await PostModel.find().limit(100);
        posts.forEach(da =>{
            var newObj={};
            newObj.id= da.id;
            newObj.name = da.name;
            newObj.url = da.url;
            newObj.caption = da.caption;
            newObj.Dtime = da.Dtime;
            SampleData.unshift(newObj);
        })
        data = SampleData;
        //console.log(data);
    }
    catch(err){
        console.log(err);
    }
    res.json(data);
});

//post Request
app.post('/memes',async (req,res) => {
        //console.log(req.query);
        try{
            const posts = await PostModel.countDocuments();
            //console.log(posts);
            dataLength = `${posts+1}`;
        }
        catch(err){
            console.log('rer');
        }
        var obj = {id: dataLength};
        var newObj=req.body;
       // console.log(req.body);
        newObj.id= dataLength;
        // newObj.name = req.query.name;
        // newObj.url = req.query.url;
        // newObj.caption = req.query.caption;
        var date = new Date();
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var seconds = date.getSeconds();
            var ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0'+minutes : minutes;
            seconds = seconds < 10 ? '0'+ seconds:seconds;
            var strTime = hours + ':' + minutes + ':' + seconds+ ' ' +ampm;
            var strDate = date.getFullYear() + "/" + (date.getMonth()+1) + "/" + date.getDate() + " "+strTime;
            //console.log(strDate);
        newObj.Dtime =strDate;
        //Adding It On top
        data.unshift(newObj);
        const postData = new PostModel(newObj);
        try{
            const savedData = await postData.save();
            //console.log(savedData);
            res.json(obj);
        }
        catch(err){
            console.log(err);
            res.json({mess:err})
        }
               
        
        
});



// Retriving the data based on ID param
app.get('/memes/:id',(req,res)=>{
    
    var arrObj = [];
    data.forEach(da => {
        if(req.params.id === da.id)
        {var obj = {};
            obj.id = da.id;
            obj.name = da.name;
            obj.url = da.url;
            obj.caption = da.caption;
            obj.Dtime = da.Dtime;
            arrObj.push(obj);
        }
    });
    
    res.json(arrObj);
})

// Retriving the Data Based on Name Param
app.get('/memes/name/:name',(req,res)=>{
    
    var arrObj = [];
    
    data.forEach(da => {
        //console.log('I am here',req.params.name.toLowerCase(),da.name.toLowerCase());
        if(da.name.toLowerCase().includes(req.params.name.toLowerCase()))
        {var obj = {};
            obj.id = da.id;
            obj.name = da.name;
            obj.url = da.url;
            obj.caption = da.caption;
            obj.Dtime = da.Dtime;
            arrObj.push(obj);
            //console.log('new unss',arrObj);
        }
    });
    res.json(arrObj);
});

app.patch('/memes/:id', async function (req, res) {
    var updateObject = req.body; 
    var id = req.params.id;
    var flag = 0;
    try{
        const posts = await PostModel.find();
        posts.forEach(da =>{
            if(da.id == id)
            {
                flag = 1;
            }
        })
    }
    catch(err){
        console.log(err);
    }
    if(flag == 0)
    res.sendStatus(404);
    else{
        try{
            const posts = await PostModel.updateOne({id  : id}, {$set: updateObject});
            res.sendStatus(200);
        }
        catch(err){
            console.log('rer',err);
            res.sendStatus(404);
        }
    }
});


// connect to db
        const url = process.env.DB_CONNECTION;

        const connectionParams={
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true 
        }
        mongoose.connect(url,connectionParams)
            .then( () => {
                console.log('Connected to database ')
            })
            .catch( (err) => {
                console.error(`Error connecting to the database. \n${err}`);
            })


app.listen(port, ()=>{
    console.log('listening to port ');
})