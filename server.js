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
    favourite_locations: {
      type: Array,
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

  const User = mongoose.model("User", UserSchema);
  const Admin = mongoose.model("Admin", AdminSchema);
  const Location = mongoose.model("Location", LocationSchema);
  const Event = mongoose.model("Event", EventSchema);

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


  // load events data from events.xml into database
  // fs.readFile('public/events.xml', function (err, data) {
  //   parser.parseString(data, function (err, result) {
  //     const events = result.events.event;
  //     events.forEach((event) => {
  //       Location.findOne({ locId: event.venueid[0] })
  //         .then(location => {
  //           let newEvent = new Event({
  //             eventId: event.$.id,
  //             title: event.titlee[0],
  //             location: location._id,
  //             dateTime: event.predateE[0],
  //             description: event.desce && event.desce[0] ? event.desce[0] : '',
  //             presenter: event.presenterorge && event.presenterorge[0] ? event.presenterorge[0] : '',
  //             price: event.pricee && event.pricee[0] ? event.pricee[0] : '',
  //           });
  //           newEvent
  //             .save()
  //             .then((event) => {
  //               // after saving the event, add its id to the location's events array
  //               if (!location.events.includes(event._id)) {
  //                 return Location.findOneAndUpdate(
  //                   { _id: event.location },
  //                   { $push: { events: event._id } },
  //                   { new: true },
  //                 );
  //               }
  //             })
  //             .then(() => {
  //               console.log("a new event is saved successfully");
  //             })
  //             .catch((error) => {
  //               console.log("failed to save new event");
  //             });
  //         })
  //         .catch(err => {
  //           console.log("failed to find location");
  //         });
  //     });
  //   });
  // });

  fs.readFile('public/events.xml', function (err, data) {
    parser.parseString(data, function (err, result) {
      const events = result.events.event;
      events.forEach((event) => {
        Location.findOne({ locId: event.venueid[0] })
          .then(location => {
            let pricee = event.pricee && event.pricee[0] ? event.pricee[0] : '';
            let prices = pricee.replace(/[^\d,]/g, '').split(',').map(Number);

            let newEvent = new Event({
              eventId: event.$.id,
              title: event.titlee[0],
              location: location._id,
              dateTime: event.predateE[0],
              description: event.desce && event.desce[0] ? event.desce[0] : '',
              presenter: event.presenterorge && event.presenterorge[0] ? event.presenterorge[0] : '',
              price: prices,
            });
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
          });
      });
    });
  });

  app.get("/user/locations", (req, res) => {
    Location.find({})
      .sort({ events: -1 }) // sort by the number of events in descending order
      .then((locations) => {
        // Add a new field 'count' to each location
        const locationsWithCount = locations.map(location => ({
          ...location._doc,
          count: location.events.length,
        }));
        res.json(locationsWithCount);
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
    const User_Name = req.query.username;
    const Type = req.query.type;

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



  });
});

const server = app.listen(80);