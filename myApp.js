require("dotenv").config();

let express = require("express");
let app = express();
const PORT = 3000;

app.listen(PORT, err =>{
   if(err){
      console.log("Something bad Happened");
   }
   console.log("Listening to Port: ", PORT);
});

app.use(express.static(__dirname));

app.get("/",(req,res) => {
   const path = __dirname + "/views/index.html";
   res.sendFile(path);
});

app.get("/json",(req,res)=>{
   if(process.env.MESSAGE_MODE === "uppercase"){
      res.json("hallo welt".toUpperCase());
      process.env.MESSAGE_MODE = "lowercase";
   }
   res.json({Apfel : "300"});
});


