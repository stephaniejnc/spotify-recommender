// get express
const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')

const indexRouter = require('./routes/index')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.static(__dirname + '/public'))

app.use('/', indexRouter)

var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var config = require('./config');
var tracks = require('./tracks')(config);

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/test', function(req, res) {
    tracks.getTrackById(1000, function(err, tracks) {
        if (err) return next(err);
        // for(i = 0; i < tracks.length; ++i) {
        //     console.log("Song ", tracks[i].id)
        //     console.log("Title: ", tracks[i].title)
        //     console.log("Artist(s): ", tracks[i].artist)
        // }
        console.log(tracks);
    });
});

console.log('Listening on port 8888')
app.listen(process.env.PORT || 8888)