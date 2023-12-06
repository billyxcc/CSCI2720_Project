const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());
app.use(express.json());

const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/myDatabase'); 

const db = mongoose.connection;
// Upon connection failure
db.on('error', console.error.bind(console, 'Connection error:'));
// Upon opening the database successfully
db.once('open', function () {
  console.log("Connection is open...")
  //We have User and Admin database
  const UserSchema = mongoose.Schema({
    UserName: {
      type: String,
      required: [true, "Username is required"],
    },
    PassWord: {
      type: String,
      required: true,
    },
  });
  
  const User = mongoose.model("User", UserSchema);
  const Admin = mongoose.model("Admin", UserSchema);
  //Sign-up
  app.get("/signup", (req,res)=>{ 
    console.log("good");
    let user_name=req.query.username;
    let pass_word=req.query.password;
    console.log(user_name);

    console.log(pass_word) ;
    let newUser= new User({
      UserName: user_name,
      PassWord: pass_word
    });
    //Firstly,to check whether usename is used,if not used,create a new User's data in database.
    User.find({UserName:{$eq:user_name}})
    .then((data) =>{
      if(data.length==0){
        console.log(data.length);
      
        newUser
        .save()
        .then(() => {
          console.log("a new user account created successfully");
          res.send( 'You are Signed up for '+ user_name+' '+pass_word+'!');
        })
        .catch((error) => {
          console.log("failed to save new user account");
          res.send( 'Failed to save your account');
        });
      } else{
        console.log(data.length);
        console.log("Username is used!");
        res.send( 'Username is used!');
      }
    })
    .catch((err) => {
      console.log("failed to read");
    });

   });
  //login
});


const server = app.listen(80);