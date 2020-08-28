// get express
const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')

const indexRouter = require('./routes/index');
require('dotenv').config();

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
request = require('request-promise')
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
const { ESRCH } = require('constants');
const { get } = require('request-promise');

const dotenv = require('dotenv');
dotenv.config();

var client_id = process.env.CLIENT_ID; // Your client id
var client_secret = process.env.CLIENT_SECRET; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

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
  var scope = 'user-read-private user-read-email playlist-read-private';
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
          assign_global(access_token, body.id)
          res.redirect('userhome/#' +
            querystring.stringify({
              access_token: access_token,
              refresh_token: refresh_token,
              user: body.id
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

// GET logged in user's playlists
app.get('/playlists', function (req, res) {

  getPlaylists();

  function getPlaylists() {

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

// set up endpoint for POST
app.post('/track', (req, res, next) => {
  console.log('I got a track!')
  console.log(req.body)
  track = req.body

  tracks.addTrack(track.artists, track.audio_features, track.name, track.track_id, track.playlist_id, function (err) {
    if (err) return next(err);
    console.log('You added a track entity to Datastore!');
  });

  // best practices to end
  res.json({
    status: 'Success: tracks of selected playlist added to Datastore'
  })
})

// user and token are global vars! 
app.get('/recommendations/:playlist_id', async function (req, res) {
  // list of tracks in playlist
  // input: tracklist
  var initPlaylist = [];
  var finalPlaylist = [];
  tracks.getTracksByPlaylist(req.params.playlist_id, async (err, songs) => {
    if (err) { console.log(err) }
    for (var i = 0; i < songs.length; i++) {
      initPlaylist.push(songs[i].track_id)
    };

    initPlaylist = shuffle(initPlaylist);

    const initLen = initPlaylist.length;
    var currPlaylist = []; // list of [chunkLen] songs
    var accPlaylist = []; // cumulative list of recommendations
    var chunksPlaylist = []; // partitioned initPlaylist
    var countPlaylist = []; // counter version of accPlaylist (more compact version)
    var chunkLen = 5; // default size of chunks

    if (initLen <= 5) {
      chunkLen = (initLen / 2) + 1;
    }

    // chunking initPlaylist
    for (var i = 0; i < initLen; i += chunkLen) {
      chunksPlaylist[chunksPlaylist.length] = initPlaylist.slice(i, i + chunkLen);
    }

    for (var j = 0; j < chunksPlaylist.length; j++) { // for each chunk

      currPlaylist = chunksPlaylist[j];

      await getRecs(currPlaylist)
        .then(docs => {
          docs = JSON.parse(docs);
          for (track in docs["tracks"]) {
            t = docs["tracks"][track];
            accPlaylist.push(t['id']);
          }
          return accPlaylist;
        })
        .catch(err => {
          res.status(400).send(err);
        });
    }
    countPlaylist = countRepeats(accPlaylist);

    // truncate countPlaylist to initLen
    countPlaylist = Object.keys(countPlaylist).slice(0, initLen);

    await getTracks(countPlaylist)
      .then(docs => {
        // console.log("docs : " + docs);
        docs = JSON.parse(docs);
        finalPlaylist = docs;
        res.status(200).json({
          count: docs.tracks.length,
          recommendations: docs
        });
      })
      .catch(err => {
        res.status(400).json(err);
      });

  })

  // functions

  // shuffle array
  function shuffle(lst) {
    length = lst.length - 1;
    while (length > 0) {
      index = Math.floor(Math.random() * length);
      // swap
      var tmp = lst[length];
      lst[length] = lst[index]
      lst[index] = tmp;
      length--;
    }
    return lst;
  }

  // get recommendations from Spotify 
  async function getRecs(tracks = [], artists = []) {
    var seed_tracks = "";
    if (tracks.length >= 1) {
      seed_tracks += "seed_tracks=";
      for (var i = 0; i < tracks.length - 1; i++) {
        seed_tracks += tracks[i] + "%2C";
      };
      seed_tracks += tracks[tracks.length - 1];
    };

    console.log("REC INPUT: " + tracks);

    var limit = 8;
    var min_energy = 0.4;
    var min_popularity = 30;

    var playlistOptions = {
      url: `https://api.spotify.com/v1/recommendations?limit=${limit}&${seed_tracks}&min_energy=${min_energy}&min_popularity=${min_popularity}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8'
      }
    }
    var url = `https://api.spotify.com/v1/recommendations?limit=${limit}&${seed_tracks}&min_energy=${min_energy}&min_popularity=${min_popularity}`;

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
  };

  // getting several tracks
  async function getTracks(lst = []) {
    if (lst.length < 1) {
      return [];
    }
    var ids = "";
    for (var i = 0; i < lst.length - 1; i++) {
      ids += lst[i] + "%2C";
    }
    ids += lst[lst.length - 1];

    var playlistOptions = {
      url: `https://api.spotify.com/v1/tracks?ids=${ids}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8'
      }
    }

    console.log('url: ' + `https://api.spotify.com/v1/tracks?ids=${ids}`);
    var tracks = [];

    await request.get(playlistOptions, function (error, response, body) {
      tracks = body;
    })
    return tracks;
  };

});


console.log('Listening on port 8888')
app.listen(process.env.PORT || 8888)