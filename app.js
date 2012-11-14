
/**
 * Module dependencies.
 */

var express = require('express')
  , assert = require('assert')
  , routes = require('./routes');

var app = module.exports = express.createServer();





var io = require('socket.io').listen(app);
app.listen(process.env.PORT,process.env.IP);

//Routing  - file that get served
app.get('/', function(req, res){
    res.sendfile( __dirname + '/index.html');
});

 
var mongoose = require('mongoose');

    if (process.env.MONGOLAB_URI) {
        console.log('print Uri 1 '+  process.env.MONGOLAB_URI );
        var   db =  mongoose.createConnection(process.env.MONGOLAB_URI);
    }
    else {
        console.log('print Uri 2'+ process.env.MONGOLAB_URI );
        var  db = mongoose.createConnection(process.env.IP, 'tester', process.env.PORT, { db: { safe: true }});
    }
    
    
    db.on('error', function(err){});
    assert.equal('object', typeof db.options);
    assert.equal('object', typeof db.options.server);
    assert.equal(true, db.options.server.auto_reconnect);
    assert.equal('object', typeof db.options.db);
    assert.equal(false, db.options.db.forceServerObjectId);
    assert.equal('tester', db.name);
    assert.equal(process.env.IP, db.host);
    assert.equal( process.env.PORT, db.port);
   
   
var schema = mongoose.Schema({ name: 'string' });

schema.path('name').get(function (v) {
  return v + ' is my name';
});
schema.set('toObject', { getters: true });


var User = db.model('User', schema);

var kitty = new User({ name: 'Zildjian' });
kitty.save(function (err) {
  if (err) // ...
  console.log('meow error');

});


var mimi = new User({ name: 'miezel' });
mimi.save(function(err){
    if(err){
        console.log(err);
        throw err; 
    }else{
        console.log('saved!');
    }

});

console.log(mimi);
console.log(kitty);

User.find({}, function(err, result) {
    result.each(function(err, band) {
        console.log(band);
    });
     console.log('waiting for user find');
});


var MyModel = db.model('User'); // Retrieve the model using the connection instance

MyModel.find({}, function(err, docs){
   if(err){} //
   console.log(docs); // Works
});




User.findOne({},function(err, result) {
    if (err) throw err;
    console.log(result);
});

try {
//console.log(db.models.User.findOne({}));    
}

catch (e)


{
    console.log('error :'+e.message);    
}
 db.close();
//usernames which are currently connected to the cat
var usernames = {};
io.set('log level', 0);  //prevent the server from spitting out too much debug stuff
io.sockets.on ('connection', function(socket) {
        
        //when the client emits 'sendchat' this listens and excecutes
        socket.on('sendchat', function (data) {
                // we tell the client to execute ' updatechat' with 2 parameters
                io.sockets.emit('updatechat', socket.username, data);
            
        });
        
        //When the client emits 'adduser', this listens and executes 
        socket.on('adduser', function(username) {
            //we store the username in the socket session for this client
            socket.username = username;
            //add the client's username to the global list
            usernames[username] = username;
            // echo to client they've connected
            socket.emit('updatechat', 'SERVER', ' you are connected');
            
            // echo globally (all client) that a person has connected
            socket.broadcast.emit('updatechat', 'SERVER', username+ ' has connected');
            //update the list of users in chat , client-side
            io.sockets.emit('updateusers', usernames);
        
        });
        
        // when the user disconnets.. perform this
        socket.on('disconnect', function(){
            //remove the username from the gobal usernames list
            delete usernames[socket.username];
            //update list of users in chat , client-side
            io.sockets.emit('updateusers', usernames);
            //echo globally that this client has left
            socket.broadcast.emit('updatechat', 'SERVER', socket.username +'has disconnected');
        });
        
});
















/*
// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);

app.listen(process.env.PORT,process.env.IP);
//console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
*/