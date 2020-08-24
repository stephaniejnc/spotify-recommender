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

var tracks = require('./tracks')();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/test', function(req, res, next) {
    // Get all tracks in a playlist
    tracks.getTracksByPlaylist('myPlaylist123', function(err, tracks) {
        if (err) return next(err);
        console.log(tracks);
    });

    // Adding a track
    var artists = ['Taylor Swift'];
    var audio_features = {
                            "duration_ms" : 255349,
                            "key" : 5,
                            "mode" : 0,
                            "time_signature" : 4,
                            "acousticness" : 0.514,
                            "danceability" : 0.735,
                            "energy" : 0.578,
                            "instrumentalness" : 0.0902,
                            "liveness" : 0.159,
                            "loudness" : -11.840,
                            "speechiness" : 0.0461,
                            "valence" : 0.624,
                            "tempo" : 98.002,
                            "id" : "06AKEBrKUckW0KREUWRnvT",
                            "uri" : "spotify:track:06AKEBrKUckW0KREUWRnvT",
                            "track_href" : "https://api.spotify.com/v1/tracks/06AKEBrKUckW0KREUWRnvT",
                            "analysis_url" : "https://api.spotify.com/v1/audio-analysis/06AKEBrKUckW0KREUWRnvT",
                            "type" : "audio_features"
                        };
    tracks.addTrack(artists, audio_features, 'A song', '12345', 'myPlaylist123', function(err) {
        if (err) return next(err);
        console.log('You added a song!');
    });

    // Getting audio features from a track
    async function queryAudioFeatures(track_id) {
        const audio_features = await tracks.getAudioFeaturesById(track_id);
        console.log(audio_features);
    }
    queryAudioFeatures('12345');
});

console.log('Listening on port 8888')
app.listen(process.env.PORT || 8888)