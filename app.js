var express = require('express');
var app = express();
// Import mongoose for DB connection
const mongoose = require('mongoose');
require('dotenv/config');

const PostModel = require('./models/posts');
const bodyParser = require('body-parser');
let port = process.env.PORT || 8081;

//For Swagger-UI
const swaggerUi = require('swagger-ui-express'),swaggerDocument = require('./swagger.json');


var dataLength;

var data = [ ];
//middleWare
// Allowing cros
app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-with, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods","POST, GET, PATCH");
    res.setHeader("Set-Cookie", "HttpOnly;Secure;SameSite=Strict");
    next();
});

app.use(bodyParser.urlencoded({extended: true}));


app.use(bodyParser.json());

app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// For Getting Latest 100 Memes without Time Parameter
app.get('/memes', async (req, res)=>{
    var DataObjWithoutTime = [];
    try{
        // Retrieving Latest 100 Memes Data From DataBase
        const posts = await PostModel.find().sort({$natural:-1}).limit(100);
        posts.forEach(da =>{
            var newObj={};
            newObj.id= da.id;
            newObj.name = da.name;
            newObj.url = da.url;
            newObj.caption = da.caption;
            DataObjWithoutTime.push(newObj);
        });
    }
    catch(err){
        console.log(err);
    }
     // sending Back Json Data to the FronEnd
    res.json(DataObjWithoutTime);
});

// With Time Parameter used to disply content in Frontend
app.get('/memes/time', async (req, res)=>{
    var SampleData = [];
    try{
        const posts = await PostModel.find().sort({$natural:-1}).limit(100);
        posts.forEach(da =>{
            var newObj={};
            newObj.id= da.id;
            newObj.name = da.name;
            newObj.url = da.url;
            newObj.caption = da.caption;
            newObj.Dtime = da.Dtime;
            SampleData.push(newObj);
        })
        data = SampleData;
        //console.log(data);
    }
    catch(err){
        console.log(err);
    }
     // sending Back Json Data to the client
    res.json(data);
});

//post Request
app.post('/memes',async (req,res) => {
   
        
        var newObj = req.body;

        // to Remove Extra Spaces
        newObj.name = newObj.name.trim();
        newObj.url = newObj.url;
        newObj.caption = newObj.caption.trim();
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
        newObj.Dtime =strDate;
        var flag = 0;
        
        if(newObj.caption == '' || newObj.url == '' || newObj.name == '' || newObj.caption == null || newObj.url == null || newObj.name == null)
        {
            res.sendStatus(417);
            
        }
        else{
        // Verifying Whether the same data is already present in DB
                    try{
                        const posts = await PostModel.find();
                        posts.forEach(da =>{
                            if(da.name == newObj.name && da.url == newObj.url && da.caption == newObj.caption)
                            {
                                flag = 1;
                            }
                        });
                    }
                    catch(err){
                        console.log(err);
                    }
                
                    if(flag==1)
                        {
                            // if Same Data is present
                            res.sendStatus(409);
                        }
                    else{
                        // Getting dataLength For ID of the meme
                        try{
                            const posts = await PostModel.countDocuments();
                            dataLength = `${posts+1}`;
                        }
                        catch(err){
                            console.log('rer');
                        }
                        
                        var obj = {id: dataLength};
                        newObj.id = dataLength;
                        const postData = new PostModel(newObj);
                        try{
                            const savedData = await postData.save();
                            res.json(obj);
                        }
                        catch(err){
                            console.log(err);
                            res.json({mess:err})
                        }
                    }
         }
});


// Retriving the data based on ID parameter
app.get('/memes/:id',async (req,res)=>{
    
    // flag is used whether ID is present or not flag = 1 implies present
    var arrObj = [],flag=0;
    
    try{
        const posts = await PostModel.find();
        posts.forEach(da =>{
            if(da.id == req.params.id)
            {
                var obj = {};
                obj.id = da.id;
                obj.name = da.name;
                obj.url = da.url;
                obj.caption = da.caption;
                //obj.Dtime = da.Dtime;
                arrObj.push(obj);
                flag = 1;
            }
        });
        
    }
    catch(err){
        console.log(err);
    }
    if(flag == 0)
    res.sendStatus(404);
    else
    res.json(arrObj);
    
});

app.get('/memes/time/:id',async (req,res)=>{
    
    // flag is used whether ID is present or not flag = 1 implies present
    var arrObj = [],flag=0;
    
    try{
        const posts = await PostModel.find();
        posts.forEach(da =>{
            if(da.id == req.params.id)
            {
                var obj = {};
                obj.id = da.id;
                obj.name = da.name;
                obj.url = da.url;
                obj.caption = da.caption;
                obj.Dtime = da.Dtime;
                arrObj.push(obj);
                flag = 1;
            }
        });
        
    }
    catch(err){
        console.log(err);
    }
    if(flag == 0)
    res.sendStatus(404);
    else
    res.json(arrObj);
    
})
// Retriving the Data Based on Name Param
app.get('/memes/name/:name',async (req,res)=>{
    
     // flag is used whether ID is present or not flag = 1 implies present
     var arrObj = [],flag=0;
    
     try{
         const posts = await PostModel.find();
         posts.forEach(da =>{
             if(da.id == req.params.id)
             {
                 var obj = {};
                 obj.id = da.id;
                 obj.name = da.name;
                 obj.url = da.url;
                 obj.caption = da.caption;
                 obj.Dtime = da.Dtime;
                 arrObj.push(obj);
                 flag = 1;
             }
         });
         
     }
     catch(err){
         console.log(err);
     }
     if(flag == 0)
     res.sendStatus(404);
     else
     res.json(arrObj);
});

app.patch('/memes/:id', async function (req, res) {
  
    var updateObject = {}; 
    updateObject.caption = req.body.caption;
    updateObject.url = req.body.url;
    updateObject.url = updateObject.url.trim();
    updateObject.caption = updateObject.caption.trim();
    var id = req.params.id;

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
        updateObject.Dtime = strDate;

    // flag is used whether ID is present or not flag = 1 implies present
    // flagDatais used whether given data is valid or not
    
    var flag = 0,FlagData = 0;
    // checking whether given url and caption are empty or not
    if(updateObject.caption == null || updateObject.caption == "" )
    {
        delete updateObject.caption;
    }
    else if(updateObject.url == null || updateObject.url == "" )
        delete updateObject.url;  
    

    if(!FlagData){
        try{
            const posts = await PostModel.find();
            posts.forEach(da =>{
                if(da.id == id)
                {
                    flag = 1;
                }
            });
        }
        catch(err){
            console.log(err);
        }
        
        if(flag == 0)
        res.sendStatus(404);
        else{

            // flag is used whether same data is present or not flag == 1 memes present
    
            var flag = 0;
            try{
                const posts = await PostModel.find();
                posts.forEach(da =>{
                    if(da.id != id && da.name == req.body.name && da.url == updateObject.url && da.caption == updateObject.caption)
                    {
                        flag = 1;
                    }
                });
            }
            catch(err){
                console.log(err);
            }
            if(flag == 0){
                try{
                    const posts = await PostModel.updateOne({id  : id}, {$set: updateObject});
                    // for success
                    res.sendStatus(200);
                }
                catch(err){
                    console.log('rer',err);
                    // for failure
                    res.sendStatus(404);
                }
            }
            else{
                // for conflict
                res.sendStatus(409);
            }
        }
    }
    else
    res.sendStatus(409);
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