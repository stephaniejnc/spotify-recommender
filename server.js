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


/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = process.env.client_id; // Your client id
var client_secret = process.env.client_secret; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length) {
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

app.get('/login', function (req, res) {

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

app.get('/callback', function (req, res) {

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

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
          refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function (error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function (req, res) {

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

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

// generating recommendations using Spotify API 
app.get('/recommendation', function (req, res) {
  // assume list of playlist track objects
  // need: track id, artist id 
  var playlist = req.body.playlist;
  // TODO: verify valid playlist
  // TODO: get playlist tracks + artists
  var finPlaylist = [];
  var partitions = [];
  var currPartition = new Set();

  // tracks + artist paritions
  var spacing = 5;
  for (var i = 0; i < playlist.length; i += spacing) {
    partitions[partitions.length] = playlist.slice(i, i + spacing);
  }

  // pass into spotify web api
  /*
    npm install --save spotify-web-api-node axios url cors
    
    var router = express.Router();


    var SpotifyWebApi = require('spotify-web-api-node');
    scopes = ['user-read-private', 'user-read-email','playlist-modify-public','playlist-modify-private']

    require('dotenv').config();

    var spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_API_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.CALLBACK_URL,
    });

    # get user playlists
    app.get('/playlists', async (req,res) => {
    try {
      var result = await spotifyApi.getUserPlaylists();
      console.log(result.body);
      res.status(200).send(result.body);
    } catch (err) {
      res.status(400).send(err)
    }
    # get recommendations
    router.get('/recommendations', async (req, res) => {
      var recs = await spotifyAPI.getRecommendations(options)
      .then(result => {
        res.status(200).send(result.body);
      })
      .catch(err => {
        res.status(400).send({error: err})
      })
    }

});
  */
  var endpoint = "https://api.spotify.com/v1/recommendations/available-genre-seeds"


  /*
  curl -X "GET" “URL” 
-H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer auth_token”

-H are headers
URL is the link we have to build 
sample: https://api.spotify.com/v1/recommendations?limit=10&market=ES&seed_artists=4NHQUGzhtTLFvgF5SZesLK&seed_genres=classical%2Ccountry&seed_tracks=0c6xIDDpzE81m2q797ordA
limit, market, seed_artists are query parameters; we will only use limit, seed_artists, and seed_tracks
“GET” - make a get request 
auth_token i the authentication token
content-type is the type of content sent to server
  */

  // build the URL - taken from https://github.com/JMPerez/spotify-web-api-js/blob/81f1a77461e02f2f73a284f092de0a76bfa925d5/src/spotify-web-api.js#L58
  var parseURL = function (url, param) {
    var quotes = '';
    for (var key in param) {
      //if we defined a value for param
      if (param.hasOwnProperty(key)) {
        var value = param[key];
        //building something like limit=10&
        quotes += encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
      }
    }
    if (quotes.length > 0) {
      quotes = quotes.substring(0, quotes.length - 1);
      url = url + "?" + quotes;
    }
    return url;
  }
  // set headers
  if (access_token) {
    req.setRequestHeader('Authorization: Bearer ' + access_token)
  }

  //TODO - request the recommendation given the ID and header
  // request data from spotify using URL and headers


  // store response playlists
  var currRec = [];


  res.status(200).send({
    "recommendations": finPlaylist
  })
})

console.log('Listening on port 8888')
app.listen(process.env.PORT || 8888)