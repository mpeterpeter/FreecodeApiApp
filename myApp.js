require("dotenv").config();

//DataBase setup
const goose = require("mongoose");
goose.connect(process.env.MONGO_DB_URI,{useNewUrlParser: true, useUnifiedTopology: true});
const db = goose.connection;
db.once("open",()=>{
   console.log("DB is ready to use");
});

const bodyParser = require("body-parser");
const express = require("express");

let app = express();
const PORT = 3000;

app.listen(PORT, err =>{
   if(err){
      console.log("Something bad Happened");
   }
   console.log("Listening to Port: ", PORT);
});

//Body-parser for post request, besiedelt req.body mit request daten
app.use(bodyParser.urlencoded({exended : false}));
app.use(bodyParser.json());

//ein einfacher logger: Riehenfolge spielt dabei eine Rolle
app.use("/",(req,res,next)=>{
   console.log(req.body);
   console.log(`${req.method} ${req.path} - ${req.ip}`);
   next();
});

//echo the paths /:word will match :word and place it in req.params = {word: string}
app.get("/:word/echo", (req, res) => {
   const { word } = req.params;
   res.json({
     echo: word
   });
 });

//http query url/name?param=peter&param2=miller
//post für die From mit action="/name"
app.route("/name")
   .get((req,res)=>{
      console.log(req.query);
      let fname = req.query.fname;
      let lname = req.query.lname;
      if(fname && lname){
         res.json({name : fname + " " + lname});
      }
      else{
         res.send("ParameterNames do not match!");
      }
   })
   .post((req,res)=>{
      console.log(req.body);
      res.send(req.body.first + " " + req.body.last);
   });

//chain middleware and handler
app.get("/now",(req,res,next)=>{
   req.time = new Date().toString();
   next();
}, (req, res)=>{
   res.json({time : req.time});
});

//serve index.html
app.get("/",(req,res) => {
   const path = __dirname + "/views/index.html";
   res.sendFile(path);
});

//serve style.css and the .js files (static serving)
app.use(express.static(__dirname));

app.get("/json",(req,res,next)=>{
   let message_object = {
      message : "hallo welt"
   };

   if(process.env.MESSAGE_MODE === "uppercase"){
      message_object.message = message_object.message.toUpperCase();
   }
   res.json(message_object);
   next();
});


//------ NEW-------------//
//MONGO_DB
//Schema
const personSchema = new goose.Schema({
   name : {
      type : String,
      required : true
   },
   age : Number,
   favoriteFoods : [String]
});

let Person = goose.model("Person", personSchema);

//Building the Api
const createPersonFromModel = (P) => {
   let newPerson = new Person ({
      name : P.name,
      age : P.age,
      favoriteFoods : P.favoriteFoods
   });

   return newPerson;
};

//save Model -> document
const saveModel = (model) => {
   model.save((err,data)=>{
      if(err) throw err;

      console.log("Saved: ",data);
   });
};

//create and Save
var createAndSavePerson = function(done) {
   var janeFonda = new Person({name: "Jane Fonda", age: 84, favoriteFoods: ["eggs", "fish", "fresh fruit"]});
 
   janeFonda.save(function(err, data) {
     if (err) return console.error(err);
     console.log(data);
   });
 };

let Peter = createPersonFromModel({name : "Peter Miller", age : 32 , favoriteFoods : ["Pizza"]});

//Document finden
Person.find({ name : /ruth/i}).exec((err, data)=>{
   if(err) throw err;
});

//create Many from a Array
let users = [
   {
      name : "Josef",
      age : 31,
      favoriteFoods : ["Linsen mit Speck"]
   },
   {
      name : "Ruth",
      age : 24,
      favoriteFoods : ["Schleckle"]
   },
   {
      name : "Peter",
      age : 32,
      favoriteFoods : ["Bohnen","Noch mehr Bohnen"]
   }
];

let Users = users.map(user => createPersonFromModel(user));

const saveMany = (Persons) => {
   goose.model("Person").create(Persons);
};

//saving Users
//saveMany(Users);

//finding all and showing them, returns a query, exec behandelt die query als json
//the Document still needs to be saved...

const deleteAllByModel = (modelName) => {
   let _data = goose.model(modelName).find().exec((err, data)=>{ 
      for(let i=0; i < data.length; i++)
      goose.model(modelName).deleteOne({name : data[i].name},(err, report) => {
         console.log(report);
      });
   });
};

const deleteManyByName = (name) => {
   goose.model("Person").deleteMany({name : name}, (err, report) =>{
      if(err) throw err;

      console.log(report);
   });
};

//find by name
let us = [];
function findPeopleByName(personName){
   let myPromise = new Promise((res,rej) => {
      goose.model("Person")
         .find(personName?{name : new RegExp(personName,"i")}:undefined)
         .exec((err,data) => {
            if(err) {
               rej(err);
            }
            res(data);
         });
   });

   return myPromise;
}

findPeopleByName("Peter")
   .then(data => {
      us = [...us, data];
      console.log(us);
   })
   .catch(err => {
      consolog.log(err);
   });



























