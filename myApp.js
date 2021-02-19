require("dotenv").config();
let bodyParser = require("body-parser");

let express = require("express");
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




