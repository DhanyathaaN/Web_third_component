var express = require("express");  
var path = require("path");  
var mongoose = require('mongoose');   
var bodyParser = require('body-parser');   
var morgan = require("morgan");  
var db = require("./config.js");  
var ejs = require('ejs');

var app = express();  
var port = process.env.port || 8888;  
var srcpath  =path.join(__dirname,'/public') ;  
app.use(express.static('public'));  
app.use(bodyParser.json());    
app.use(bodyParser.urlencoded({extended:true}));  
  
// Database Connectivity
var Schema = mongoose.Schema;  
var empSchema = new Schema({      
    empid: { type: String, unique : true, dropDups: true  },       
    empname: { type: String   },            
},{ versionKey: false });  
var model = mongoose.model('patient', empSchema, 'patient');  

app.get('/home', function (req, res) {  
   console.log("Got a GET request for the homepage");  
   res.send('<h1>Welcome to RIT</h1>');   
})

app.get('/about', function (req, res) {  
   console.log("Got a GET request for /about");  
   res.send('Dept. of Computer Science & Engineering');
})

//api for INSERT data from database  
app.post("/api/savedata",function(req,res){   
       
    var mod = new model(req.body);  
	req.body.serverMessage = "NodeJS replying to REACT"
	mod.save(function (err, result){                       
        if(err) 
		{ 
			console.log(err.message); 
			//res.send("Duplicate Employee ID")
			res.json({
			status: 'fail'
		    })
		} 
		else
		{
            console.log('Patient record Inserted');
			/*Sending the respone back to the angular Client */
			res.json({
			msg: 'We received your data!!!(nodejs)',
			status: 'success',mydata:req.body
			})
		}
       })     
})  

 // get data from database DISPLAY  
 app.get('/display', function (req, res) { 
//------------- USING EMBEDDED JS -----------
 model.find().sort({patid:1}).exec(
 		function(err , i){
        if (err) return console.log(err)
        res.render('disp.ejs',{patients: i})  
     })
//---------------------// sort({empid:-1}) for descending order -----------//
})

app.get('/delete.html', function (req, res) {  
   res.sendFile( __dirname + "/" + "delete.html" );    
})

//api for Delete data from database  
app.get("/delete", function(req, res) {
	//var empidnum=parseInt(req.query.empid)  // if empid is an integer
	var patidnum=req.query.patid;
	
        model.remove({"patid":patidnum},function(err, obj){
				if (err) {
					console.log("Failed to remove data.");
			} else {
				if (obj.result.n>=1)
				{
				res.send("<br/>"+patidnum+":"+"<b>Employee Deleted</b>");
				console.log("Patient Deleted")
				}
				else
					res.send("Patient Not Found")
			}
        });
  })
  
  
//Update data from database  
app.get('/update.html', function (req, res) {
    res.sendFile( __dirname + "/" + "update.html" );
})

app.get("/update", function(req, res) {
	var patname1=req.query.patname;
   	model.findOneAndUpdate({"patname":patname1},{"patname":"newpat"},{multi:true},   
    function(err,obj) {  
     if (err) {  
        res.send(err);
       console.log("Failed to updated data") 
      }
      else 
     {
      if (obj==null)
       {  res.send("Patient record Not Found") }
     else
      {
	    res.send("<br/>"+patname1+":"+"<b>Patient Name Updated</b>");
	   console.log("Patient Updated")
       }
     }
 });	
})	

//--------------SEARCH------------------------------------------
app.get('/search.html', function (req, res) {  
   res.sendFile( __dirname + "/" + "search.html" );    
})

app.get("/search", function(req, res) {
	//var empidnum=parseInt(req.query.empid)  // if empid is an integer
	var patidnum=req.query.patid;
	model.find({patid: patidnum},{patname:1,patid:1,_id:0}).exec(function(err, docs) {
    if (err) {
      console.log(err.message+ "Failed to get data.");
    } else
	{
	if (docs=='')
		res.send("<br/>"+patidnum+":"+"<b>Emplyee Not Found</b>")
	else
	    res.status(200).json(docs);
	}
  });
  })  
  
// call by default index.html page  
app.get("*",function(req,res){   
    res.sendFile(srcpath +'/index.html');  
})   
//server stat on given port  
app.listen(port,function(){   
    console.log("server start on port:"+ port);  
})  