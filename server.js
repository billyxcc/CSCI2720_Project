const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());
app.use(express.json());

const mongoose = require('mongoose');
const { error } = require('console');
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
      unique:true
    },
    PassWord: {
      type: String,
      required: true,
    },
    favourite_locations: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }],
      required: false,
    },
    Current_login: {
      type: Boolean,
      required: true,
    },
  });
  const AdminSchema = mongoose.Schema({
    UserName: {
      type: String,
      required: [true, "Username is required"],
    },
    PassWord: {
      type: String,
      required: true,
    },
    Current_login: {
      type: Boolean,
      required: true,
    },
  });

  const LocationSchema = mongoose.Schema({
    locId: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }]
  });

  const EventSchema = mongoose.Schema({
    eventId: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId, ref: 'Location',
      required: true,
    },
    dateTime: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    presenter: {
      type: String,
    },
    price: {
      type: Array,
    },
  });

  const CommentSchema = mongoose.Schema({
    commentId: {
      type: Number,
      required: true,
      unique: true,
    },
    locId: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true
    }
  });

  const RatingSchema = mongoose.Schema({
    ratingId: {
      type: Number,
      required: true,
      unique: true
    },
    value: {
      type: Number,
      required: true
    },
    locId: {
      type: Number,
      required: true
    }
  });

  const User = mongoose.model("User", UserSchema);
  const Admin = mongoose.model("Admin", AdminSchema);
  const Location = mongoose.model("Location", LocationSchema);
  const Event = mongoose.model("Event", EventSchema);
  const Comment = mongoose.model("Comment", CommentSchema);
  const Rating = mongoose.model("Rating", RatingSchema);

  //creata an admin account
  let Admin_ac = new Admin({
    UserName: 'testingadmin',
    PassWord: 'testingadmin',
    Current_login: false
  });

  Admin.find({UserName: {$eq: 'testingadmin'}})
  .then((data) => {
    if(data.length == 0){
      Admin_ac.save()
      .then((data)=> console.log("Admin account created successfully."))
      .catch((err)=> console.log(err))
    }
  })

  // load locations data from venues.xml into database
  const fs = require('fs');
  const xml2js = require('xml2js');
  const parser = new xml2js.Parser();
  fs.readFile('public/venues.xml', function (err, data) {
    parser.parseString(data, function (err, result) {
      const locations = result.venues.venue;
      locations.forEach((location) => {
        let newLocation = new Location({
          locId: location.$.id,
          name: location.venuee[0],
          latitude: location.latitude[0] ? location.latitude[0] : null,
          longitude: location.longitude[0] ? location.longitude[0] : null,
          events: [],
        });
        newLocation
          .save()
          .then(() => {
            console.log("a new location is saved successfully");
          })
          .catch((error) => {
            console.log("failed to save new location");
          });
      });
    });
  });


  fs.readFile('public/events.xml', function (err, data) {
    parser.parseString(data, function (err, result) {
      const events = result.events.event;
      events.forEach((event) => {
        Location.findOne({ locId: event.venueid[0] })
          .then(location => {
            let pricee = event.pricee && event.pricee[0] ? event.pricee[0] : '';
            let prices = pricee.replace(/;/g, ',').replace(/[^\d,]/g, '').split(',').map(Number);

            let newEvent = new Event({
              eventId: event.$.id,
              title: event.titlee[0],
              location: location._id,
              dateTime: event.predateE[0],
              description: event.desce && event.desce[0] ? event.desce[0] : '',
              presenter: event.presenterorge && event.presenterorge[0] ? event.presenterorge[0] : '',
              price: prices,
            });
            Event.findOne({ eventId: event.$.id })
              .then(existingEvent => {
                if (!existingEvent) {
                  newEvent
                    .save()
                    .then((event) => {
                      if (!location.events.includes(event._id)) {
                        return Location.findOneAndUpdate(
                          { _id: event.location },
                          { $push: { events: event._id } },
                          { new: true },
                        );
                      }
                    });
                }
              });
          });
      });
    });
  });

  app.get("/user/locations", (req, res) => {
    Location.find({})
      .then((locations) => {
        const locationsWithCount = locations.map(location => ({
          ...location._doc,
          count: location.events.length,
        })).filter(location => location.count >= 3 && location.latitude && location.longitude);
  
        const uniqueLocations = locationsWithCount.reduce((unique, location) => {
          if (!unique.some(loc => loc.latitude === location.latitude && loc.longitude === location.longitude)) {
            unique.push(location);
          }
          return unique;
        }, []).slice(0, 10);
  
        res.json(uniqueLocations);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error occurred while fetching locations");
      });
  });

  app.get("/user/locations/:id", (req, res) => {
    const id = req.params.id;
    Location.findOne({ locId: id })
      .populate('events')
      .then((location) => {
        res.json(location);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error occurred while fetching location");
      });
  });

  app.get("/user/events", (req, res) => {
    Event.find({})
      .populate('location')
      .then((events) => {
        res.json(events);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error occurred while fetching events");
      });
  });

  app.get("/user/events/:id", (req, res) => {
    const id = req.params.id;
    Event.findOne({ eventId: id })
      .populate('location')
      .then((event) => {
        res.json(event);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error occurred while fetching event");
      });
  });

  // show all favourite locations of the current user
  app.get("/user/favourites", (req, res) => {
    User.find({ Current_login: { $eq: "true" } })
      .populate('favourite_locations')
      .then((data) => {
        if (data.length == 1) {
          return res.send(data[0].favourite_locations);
        }
      })
      .catch((error) => console.log(error));
  });

  // add a location to the current user's favourite locations
  app.post("/user/favourites/:id", (req, res) => {
    const objectId = req.params.id;
    User.find({ Current_login: { $eq: "true" } })
      .then((data) => {
        if (data.length == 1) {
          if (!data[0].favourite_locations.includes(objectId)) {
            return User.findOneAndUpdate(
              { _id: data[0]._id },
              { $push: { favourite_locations: objectId } },
              { new: true },
            );
          }
        }
      })
      .then(() => {
        res.status(200).send("Location added to favourites");
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error occurred while adding location to favourites");
      });
  });

  // remove a location from the current user's favourite locations
  app.delete("/user/favourites/:id", (req, res) => {
    const id = req.params.id;
    User.find({ Current_login: { $eq: "true" } })
      .then((data) => {
        if (data.length == 1) {
          if (data[0].favourite_locations.includes(id)) {
            return User.findOneAndUpdate(
              { _id: data[0]._id },
              { $pull: { favourite_locations: id } },
              { new: true },
            );
          }
        }
      })
      .then(() => {
        res.status(200).send("Location removed from favourites");
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error occurred while removing location from favourites");
      });
  });

  //load current
  app.get("/load", (req, res) => {

    User.find({ Current_login: { $eq: "true" } })
      .then((data) => {
        if (data.length == 1) {
          return res.send('Valid**user**' + data[0].UserName);
        }
      })
      .catch((error) => console.log(error));

    Admin.find({ Current_login: { $eq: "true" } })
      .then((data) => {
        if (data.length == 1) {
          return res.send('Valid**admin**' + data[0].UserName);
        }
      }
      )
      .catch((error) => {
        console.log(error)
      });

  });

  //Post location comment
  app.post("/comment/:locId", (req,res) => {
    const id = req.params.locId;
    const commentData = req.body;
    const content = commentData.content;
    const username = commentData.username;
    
    Comment.find()
    .sort({commentId: -1})
    .limit(1)
    .then((data) => {
      console.log(data);
      const commentId = (data.length > 0)?(data[0].commentId+1):0;
      let newComment = new Comment({
        commentId: commentId,
        locId: id,
        content: content,
        username: username, 
      });
      newComment
      .save()
      .then(()=>{res.send(newComment)});
    });
  })

  //Get location comment
  app.get("/comment/:locId", (req,res) => {
    const id = req.params.locId;

    Comment.find({locId: {$eq: id}})
    .then((data) => {
      res.setHeader('Content-Type', 'text/plain');
      res.send(data);
    })
    .catch((error) => console.log(error));
  })

  //Get location rating
  app.get("/rating/:locId", (req,res) => {
    const id = req.params.locId;
    console.log("Id: " + id);
    Rating.find({locId: {$eq: id}})
    .then((data) => {
      if(data.length > 0){
        var totalRating = 0;
        data.forEach(rating => {
          totalRating += rating.value;
        });
        res.json({ averageRating: totalRating/data.length });
      }else{
        res.json({ averageRating: 0 });
      }
    })
    .catch((err) => console.log(err));
  });

  app.post("/rating/:locId", (req,res)=>{
    const locId = req.params.locId;
    const ratingData = req.body;
    const value = ratingData.value;

    Rating.find()
    .sort({ratingId: -1})
    .limit(1)
    .then((data) => {
      const ratingId = (data.length > 0)?(data[0].ratingId+1):0;
      let rating = new Rating({
        ratingId: ratingId,
        value: value,
        locId: locId
      });
      
      rating
      .save()
      .then(res.send("201"));
    });
  });


  //Sign-up
  app.get("/signup", (req, res) => {

    const user_name = req.query.username;
    const pass_word = req.query.password;

    let newUser = new User({
      UserName: user_name,
      PassWord: pass_word,
      Current_login: false,
      favourite_locations: []
    });


    //Firstly,to check whether usename is used,if not used,create a new User's data in database.
    User.find({ UserName: { $eq: user_name } })
      .then((data) => {
        if (data.length == 0) {
          console.log(data.length);

          newUser
            .save()
            .then(() => {
              console.log("a new user account created successfully");
              res.setHeader('Content-Type', 'text/html');
              message = `
            <html>
              <head>
                <title>sign_information</title>
              </head>
              <body>
                <h1> Sign up successfully! this page is generated by the server </h1>
                  <p> Below is the sign up information for you </p>
                  <p>Login ID: ${user_name}</p>
                  <p>Return you to login page</p>
              </body>
              <script>
              const redir= setTimeout(()=>{window.location.replace("/login")},3000) ;
            </script> 
            </html>
              `;
              res.send(message);
            })
            .catch((error) => {
              console.log("failed to save new user account");
              message = `
          <html> 
            <head>
              <title> fail_information</title>
            </head>
            <body>
              <h1> Sign up Failed! <h1> 
              <h1>Missing input</h1>
              <h2>this page is generated by the server </h2>
              <p>Return you to sign up page</p>

            </body>
            <script>
              const redir= setTimeout(()=>{window.location.replace("/signup")},3000) ;
            </script> 
          </html>
            `;
              res.send(message);

            });
        } else {
          console.log(data.length);
          console.log("Username is used!");
          message = `
        <html>
          <head>
            <title>fail_information</title>
          </head>
          <body>
            <h1> Sign up Failed! Username is used!</h1>
            <h1>Please use another username</h1>
            <h2>this page is generated by the server </h2>
            <p>Return you to sign up page</p>
  
          </body>
          <script>
              const redir= setTimeout(()=>{window.location.replace("/signup")},3000) ;
          </script> 
        </html>
          `;
          res.send(message);
        }
      })
      .catch((err) => {
        console.log("failed to read");
      });

  });


  //login
  app.get("/login", (req, res) => {
    const user_name = req.query.username;
    const pass_word = req.query.password;
    const user_type = req.query.type;

    if (user_type == 'admin') {
      Admin.find({ UserName: { $eq: user_name } })
        .then((data) => {
          if (data.length == 1) {
            Admin.find({ PassWord: { $eq: pass_word } })
              .then((data) => {
                if (data.length == 1) {
                  res.send('Success**' + user_name + "**" + user_type);
                  //Upload current_login=true
                  Admin.findOneAndUpdate(
                    { UserName: { $eq: user_name } },
                    { Current_login: "true" },
                    { New: true },
                  )
                    .then((data) => { console.log('the updated data is:', data) })
                    .catch((error) => console.log(error));
                } else {
                  res.send("Failed**Invalid password");
                }
              })
              .catch((error) => console.log(error));
          } else {
            res.send("Failed**Invalid Username");
          }
        })
        .catch((error) => console.log(error));
    } else if (user_type == 'user') {
      User.find({ UserName: { $eq: user_name } })
        .then((data) => {
          if (data.length == 1) {
            User.find({ PassWord: { $eq: pass_word } })
              .then((data) => {
                if (data.length == 1) {
                  res.send('Success**' + user_name + "**" + user_type);
                  //update
                  User.findOneAndUpdate(
                    { UserName: { $eq: user_name } },
                    { Current_login: "true" },
                    { New: true },
                  )

                    .then((data) => { console.log('the updated data is:', data) })
                    .catch((error) => console.log(error));
                } else {
                  res.send("Failed**Invalid password");
                }
              })
              .catch((error) => console.log(error));
          } else {
            res.send("Failed**Invalid Username");
          }
        })
        .catch((error) => console.log(error));
    }
  });

  //log out
  app.get("/logout", (req, res) => {
      User.findOneAndUpdate(
        { Current_login: { $eq: "true" } },
        { Current_login: "false" },
        { New: true },
      )
        .then((data) => {
          let msg = `
          <html>
            <head>
              <title>logout_information</title>
            </head>
            <body>
              <h1> You are logged Out!</h1>
              <h2>this page is generated by the server </h2>
     
            </body>
            <script>
                const redir= setTimeout(()=>{window.location.replace("/")},3000) ;
            </script> 
          </html>
            `
          res.send(msg);
        })
        .catch((error) => console.log(error));

      Admin.findOneAndUpdate(
        { Current_login: { $eq: "true" } },
        { Current_login: "false" },
        { New: true },
      )
        .then((data) => {
          let msg = `
          <html>
            <head>
              <title>logout_information</title>
            </head>
            <body>
              <h1> You are logged Out!</h1>
              <h2>this page is generated by the server </h2>
     
            </body>
            <script>
                const redir= setTimeout(()=>{window.location.replace("/")},3000) ;
            </script> 
          </html>
            `
          res.send(msg);
        })
        .catch((error) => console.log(error));
  
  });

  //for admin page

  app.get("/admin/location", (req,res) => {
    Location.find({})
    .then((data)=> {res.setHeader('Content-Type', 'application/json');res.send(data)})
    .catch((err)=> console.log(err))
  });
  
  app.get("/admin/event", (req,res) => {
    Event.find({})
    .then((data)=> {res.setHeader('Content-Type', 'application/json');res.send(data)})
    .catch((err)=> console.log(err))
  });
  
  app.delete('/admin/event/del/:eventId', (req,res) => {
   
    const eventId = req.params.eventId; 
    Event.findOneAndDelete({eventId:{$eq: eventId}})
    .then((data)=> {console.log("Deleted successfully.");res.status(204);res.send("Deleted successfully.")})
    .catch((err)=>console.log(err))
  })
  
  app.put('/admin/event/create', (req,res)=>{
    const Title = req.body.Title;
    const eventLocation = req.body.eventLocation;
    const dateTime = req.body.dateTime;
    const Description = req.body.Description;
    const Presenter = req.body.Presenter;
    const Price = req.body.Price;
    Location.find({name:{$eq: eventLocation}})
    .then((data) => {
      const loc_id = data[0]._id;
      let newEvent = new Event({
        eventId: 0,
        title: Title,
        location: loc_id,
        dateTime: dateTime,
        description: Description,
        presenter: Presenter,
        price: Price
      })
  
      function MaxId(){
        Event.find({})
        .then((data)=> {
          let ID = -1;
          for(const key of data){
            if(key["eventId"]>ID){
              ID = key["eventId"]
            }
          };
          newEvent["eventId"] = ID+1;
          newEvent.save()
          .then(() => res.send("Successfully Created."))
          .catch((err) => console.log(err))
      })}
      MaxId();
    }
    )
    })
  
   app.put('/admin/event/update', (req,res)=>{
    const eventId = req.body.eventId;
    const Title = req.body.Title;
    const eventLocation = req.body.eventLocation;
    const dateTime = req.body.dateTime;
    const Description = req.body.Description;
    const Presenter = req.body.Presenter;
    const Price = req.body.Price;
    Location.find({name:{$eq: eventLocation}})
    .then((data) => {
      const loc_id = data[0]._id;
      Event.findOneAndUpdate({eventId:{$eq: eventId}}, {title: Title, location:loc_id, dateTime:dateTime, description: Description, presenter: Presenter, price: Price},{new: true})
      .then((data)=> {res.setHeader('Content-Type', 'application/json');res.send(data)})
      .catch((err) => console.log(err))
  
   }) })

   app.get('/admin/user', (req,res)=>{
    User.find({})
    .then((data)=> {res.setHeader('Content-Type', 'application/json');res.send(data)})
    .catch((err)=> console.log(err))
   })

   app.delete('/admin/user/:userName', (req,res)=>{
    const userName = req.params.userName;
    User.findOneAndDelete({UserName: {$eq: userName}})
    .then((data)=> res.send("Successfully Deleted."))
    .catch((err) => console.log(err))
   })

   app.put('/admin/user/update', (req,res)=>{
    const _id = req.body._id;
    const UserName = req.body.UserName;
    const PassWord = req.body.PassWord;
    User.find({ UserName: { $eq:  UserName } })
    .then((data)=>{
      if(data.length == 0){
        User.findOneAndUpdate({_id: {$eq: _id}}, {UserName: UserName, PassWord: PassWord}, {new: true})
        .then((data)=> res.send("Updated Successfully."))
        .catch((err)=> console.log(err))
      } else {
        console.log(data)
        let x = data[0]['_id'].toString();
        let y = _id.toString()
        if(x === y){
          User.findOneAndUpdate({_id: {$eq: _id}}, {UserName: UserName, PassWord: PassWord}, {new: true})
          .then((data)=> res.send("Updated Successfully."))
          .catch((err)=> console.log(err))
        }else {
        res.send("This user name is already used.")}
      }
    })
   })

   app.put('/admin/user/create', (req,res)=>{
    const UserName = req.body.UserName;
    const PassWord = req.body.PassWord;
    let newUser = new User({
      UserName: UserName,
      PassWord: PassWord,
      Current_login: false,
      favourite_locations: []
    })
    User.find({ UserName: { $eq:  UserName } })
      .then((data) => {
        if (data.length == 0) {
          newUser
          .save()
          .then((data) => res.send("Created Successfully."))
          .catch((err) => console.log(err))
        } else {
          res.send("This username is already used.")
        }
   })
   .catch((err)=> console.log(err))
  })


});

const server = app.listen(80);
