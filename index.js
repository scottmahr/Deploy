
var http = require ('http');	     // For serving a basic web page.
var querystring = require('querystring');
var _ = require('underscore');
var mongoose = require ("mongoose"); // The reason for this demo.
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var fs = require('fs');


app.use(cors());
app.use( bodyParser.json({limit: '50mb'}) );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  limit: '50mb',
  extended: true
}));





// Here we find an appropriate database to connect to, defaulting to
// localhost if we don't find one.  
var uristring = 
  process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  'mongodb://localhost/test';



// The http server will listen to an appropriate port, or default to
// port 5000.
var theport = process.env.PORT || 5000;

// Makes connection asynchronously.  Mongoose will queue up database
// operations and release them when the connection is complete.
mongoose.connect(uristring, function (err, res) {
  if (err) { 
    console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log ('Succeeded connected to: ' + uristring);
  }
});

// This is the schema.  Note the types, validation and trim
// statements.  They enforce useful constraints on the data.

var userSchema = new mongoose.Schema({
    cDate: { type: Date, default: Date.now },   //date item was created
    name: {type: String, lowercase: true, trim: true,required:true,unique:true},                    
    status: { type: String, default: "free" },    //free, busy, onTask    
    color: { type: String, default: "#ff9f1c" },           
    positions: { type: mongoose.Schema.Types.Mixed, default: {} },    //[eventid,x,y] , store 1000 of them
}, { versionKey: false });

var eventSchema = new mongoose.Schema({
    cDate: { type: Date, default: Date.now },   //date item was created
    name: { type: String, lowercase: true, trim: true,required:true,unique:true},   //name of event
    mapData: { type: mongoose.Schema.Types.Mixed , default: {} },  //will include walls, other things
    beaconData: { type: mongoose.Schema.Types.Mixed , default: [] }, //list of all beacons at event [uuid,x,y,description]
    taskData: { type: mongoose.Schema.Types.Mixed , default: [] },  //list of all tasks at event [type,x,y] things like trash, other things shown on map
}, { versionKey: false });


var Users = mongoose.model('deployUsers', userSchema);
var Events = mongoose.model('deployEvents', eventSchema);

// In case the browser connects before the database is connected, the
// user will see this message.
var found = ['DB Connection not yet established.  Try again later.  Check the console output for error messages if this persists.'];

var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)

app.get('/', function(req, res){
  res.redirect('/index.html');
  //res.send('our home');
});


app.use(express.static(__dirname + '/public'));



router.get('/', function(req, res) {
    res.json({ success: 'hooray! welcome to our api!' });   
});

// ----------------------------------------------------



// on routes that end in /reviews
// ----------------------------------------------------
router.route('/users')
    .post(function(req, res) {
        new Users(req.body).save(function(err,user) {
            if(err){
                res.json({ error: err });;
            }else{
                res.json(user);
            }
        });
    })

    .get(function(req, res) {
        Users.find(function(err, users) {
            if (err){
                res.json({ error: err });
            }else{
                res.json(users);
            }
        });
    });

router.route('/users/:user_id')

    // get the review with that id
    .get(function(req, res) {
        Users.findById(req.params.user_id, function(err, user) {
            if (err){
                res.json({ error: err });
            }else{
                res.json(user);
            }
        });
    })
    // update the user with this id
    .put(function(req, res) {
        Users.findById(req.params.user_id, function(err, user) {
            if (err){
                res.json({ error: err });
            }
            _.extend(user,req.body).save(function(err,user) {
                if (err){
                    res.json({ error: err });
                }else{
                    res.json(user);
                }
            });

        });
    })
        //delete user
    .delete(function(req, res) {
        //first, get the user and see if it has any reviews
        Users.findById(req.params.user_id, function(err, user) {
            if (err){
                res.json({ error: 'error getting user: ' +err });
            }else{
                Users.remove( {_id: user._id}, 
                    function(err) {
                        if (err){
                            res.json({ error: 'error removing lift: ' +err });
                        }else{
                            res.json({ sucess: 'removed user' });
                        }
                    }
                );
                
            }
        });
    })


// on routes that end in /reviews
// ----------------------------------------------------
router.route('/events')
    .post(function(req, res) {
        new Events(req.body).save(function(err,event) {
            if(err){
                res.json({ error: err });;
            }else{
                res.json(event);
            }
        });
    })

    .get(function(req, res) {
        Events.find(function(err, events) {
            if (err){
                res.json({ error: err });
            }else{
                res.json(events);
            }
        });
    });

router.route('/events/:event_id')

    // get the review with that id
    .get(function(req, res) {
        Events.findById(req.params.event_id, function(err, event) {
            if (err){
                res.json({ error: err });
            }else{
                res.json(event);
            }
        });
    })
    // update the event with this id
    .put(function(req, res) {
        Events.findById(req.params.event_id, function(err, event) {
            if (err){
                res.json({ error: err });
            }
            _.extend(event,req.body).save(function(err,event) {
                if (err){
                    res.json({ error: err });
                }else{
                    res.json(event);
                }
            });

        });
    })
        //delete event
    .delete(function(req, res) {
        //first, get the event and see if it has any reviews
        Events.findById(req.params.event_id, function(err, event) {
            if (err){
                res.json({ error: 'error getting event: ' +err });
            }else{
                Events.remove( {_id: event._id}, 
                    function(err) {
                        if (err){
                            res.json({ error: 'error removing lift: ' +err });
                        }else{
                            res.json({ sucess: 'removed event' });
                        }
                    }
                );
                
            }
        });
    })

// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

app.listen(theport);



// Tell the console we're getting ready.
// The listener in http.createServer should still be active after these messages are emitted.
console.log('http server will be listening on port %d', theport);
console.log('CTRL+C to exit');

