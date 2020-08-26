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

// Authorization Code oAuth2 flow to authenticate against Spotify Accounts.

var tracks = require('./tracks')();
var request = require('request'); // "Request" library
request = require ('request-promise')
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
const { ESRCH } = require('constants')

const dotenv = require('dotenv');
dotenv.config();

var client_id = process.env.CLIENT_ID; // Your client id
var client_secret = process.env.CLIENT_SECRET; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

var token = "1"
var user = "2"
var playlist = "playlist"

function assign_global(access_token, user_id) {
  token = access_token
  user = user_id
}

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;
        
        console.log(body)
        token = access_token
        console.log(`Token: ${token}`)

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        // we can also pass the token to the browser to make requests from there

        request.get(options, function(error, response, body) {
          console.log(body);
          // user = body.id;
          // console.log(user);
          // user is defined here and is correct
          assign_global(access_token, body.id)
          res.redirect('userhome/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token,
            user: body.id
            // these three all have values!
          }));
        })
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    })
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

app.get('/playlists', function(req, res) {

  getPlaylists();

  function getPlaylists() {

    // user and token undefined here:(
    var playlistOptions = {
      url: `https://api.spotify.com/v1/users/${user}/playlists`,
      headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json; charset=utf-8'
      }
    }
    
    request.get(playlistOptions, function(error, response, body) {
      console.log(body)
      res.send(body)
    })
  }

})

// set up endpoint for POST
app.post('/track', (req, res, next) => {
  console.log('I got a track!')
  console.log(req.body)
  track = req.body

  tracks.addTrack(track.artists, track.audio_features, track.name, track.track_id, track.playlist_id, function(err) {
    if (err) return next(err);
    console.log('You added a track entity to Datastore!');
  });

  // best practices to end
  res.json({
      status: 'Success: tracks of selected playlist added to Datastore'
  })
})

console.log('Listening on port 8888')
app.listen(process.env.PORT || 8888)