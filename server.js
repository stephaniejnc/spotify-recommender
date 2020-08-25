// get express
const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')

// spotify web api node dependency
const SpotifyWebApi = require('spotify-web-api-node');

const indexRouter = require('./routes/index');
const playlistRouter = require('./routes/playlist');
require('dotenv').config();

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.static(__dirname + '/public'))

app.use('/', indexRouter)
app.use('/playlist/', playlistRouter);

// Authorization Code oAuth2 flow to authenticate against Spotify Accounts.

var request = require('request'); // "Request" library
request = require('request-promise')
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
const { ESRCH } = require('constants');
const { get } = require('request-promise');

var client_id = process.env.CLIENT_ID; // Your client id
var client_secret = process.env.CLIENT_SECRET; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

var spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.CALLBACK_URL,
});

var token = "1"
var user = "2"

function assign_global(access_token, user_id) {
  token = access_token
  user = user_id
}

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

        var access_token = body.access_token;
        refresh_token = body.refresh_token;
        console.log(body);
        token = access_token;
        console.log(`Token: ${token}`);
        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function (error, response, body) {
          console.log(body);
          // user = body.id;
          // console.log(user);
          // user is defined here and is correct
          assign_global(access_token, body.id)
          // we can also pass the token to the browser to make requests from there
          res.redirect('/#' +
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

app.get('/playlists', function (req, res) {

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

    request.get(playlistOptions, function (error, response, body) {
      console.log(body)
      res.send(body)
    })
  }

})


// user and token are global vars! 
app.get('/recommendations', async function (req, res) {
  // list of tracks in playlist
  // input: tracklist 
  const initPlaylist = ['3HqSLMAZ3g3d5poNaI7GOU', '4CoxD8tetisleUQDA7vn1B', '44WLOqH7QayQOQdeUHeKUK', '4BKOjYosPhw334moS3wlbO', '4AlihYDqxXshKhvh5tnMfP']; // get from Datastore
  const initLen = initPlaylist.length;
  var currPlaylist = []; // list of [chunkLen] songs
  var accPlaylist = [];//['4BKOjYosPhw334moS3wlbO', '4BKOjYosPhw334moS3wlbO', '4AlihYDqxXshKhvh5tnMfP', '4CoxD8tetisleUQDA7vn1B']; // cumulative list of recommendations
  var chunksPlaylist = []; // partitioned initPlaylist
  var countPlaylist = []; // counter version of accPlaylist (more compact version)
  var chunkLen = 5; // default size of chunks

  // need: track id, artist id 
  // TODO: implement the same but for artists

  if (initLen <= 5) {
    chunkLen = (initLen / 2) + 1;
  }

  // chunking initPlaylist
  for (var i = 0; i < initLen; i += chunkLen) {
    chunksPlaylist[chunksPlaylist.length] = initPlaylist.slice(i, i + chunkLen);
  }
  console.log(initPlaylist);
  console.log(initLen);
  console.log(chunksPlaylist);

  for (var j = 0; j < chunksPlaylist.length; j++) {

    currPlaylist = chunksPlaylist[j];

    getRecs(currPlaylist)
      .then(docs => {
        docs = JSON.parse(docs);
        for (track in docs["tracks"]) {
          t = docs["tracks"][track];
          accPlaylist.push(t['id']);
          // accPlaylist.push([t['id'], t['name']]); // adds track ids
        }
        console.log(accPlaylist);
        return accPlaylist;
      })
      .catch(err => {
        res.status(400).send(err);
      })
      .then(() => {
        console.log("ACC: " + accPlaylist);
        countPlaylist = countRepeats(accPlaylist);
        // truncate countPlaylist to initLen
        countPlaylist = Object.keys(countPlaylist).slice(0, initLen);
        console.log("Count Playlist: " + countPlaylist);
        // return countPlaylist (for now; then store in DS playlist)
        res.status(200).json({
          count: countPlaylist.length,
          recommendations: countPlaylist
        });
      })
      .catch(err => {
        res.status(400).send(err);
      });
  }

  // get recommendations from Spotify 
  async function getRecs(tracks = [], artists = []) {
    var seed_tracks = "";
    var seed_artists = "";
    if (tracks.length > 1) {
      seed_tracks += "seed_tracks=";
      for (var i = 0; i < tracks.length - 1; i++) {
        seed_tracks += tracks[i] + "%2C";
      };
      seed_tracks += tracks[tracks.length - 1];
    };

    if (artists.length > 1) {
      seed_artists += "seed_artists=";
      for (var i = 0; i < artists.length - 1; i++) {
        seed_artists += artists[i] + "%2C";
      };
      seed_artists += artists[artists.length - 1] + "&";
    };
    var limit = 8;
    var min_energy = 0.4;
    var min_popularity = 30;

    var playlistOptions = {
      url: `https://api.spotify.com/v1/recommendations?limit=${limit}&${seed_artists}${seed_tracks}&min_energy=${min_energy}&min_popularity=${min_popularity}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8'
      }
    }

    var recs;
    await request.get(playlistOptions, function (error, response, body) {
      recs = body;
    });
    return recs;
  }

  // accPlaylist -> countPlaylist
  function countRepeats(lst) {

    var counts = {};

    lst.forEach(function (x) {
      counts[x] = (counts[x] || 0) + 1;
    });

    // automatically ordered from greatest to least
    return counts;
  }

});


console.log('Listening on port 8888')
app.listen(process.env.PORT || 8888)