require(dotenv).config();
// express router
const router = require('express').Router();
// spotify web api node dependency
const SpotifyWebApi = require('spotify-web-api-node');

var spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.CALLBACK_URL,
});

// spotify web api node library initial setup
var scopes = ['user-read-private', 'user-read-email', 'playlist-modify-public', 'playlist-modify-private']


// get a specific playlist
router.get('/:id', (req, res) => {
  var id = req.params.id; // playlist id
  // TODO: implement + tst
})

// get a specific playlist's tracks
router.get('/tracks/:id', (req, res) => {
  var id = req.params.id;
  // TODO: implement + test

})

// generate recommendations using Spotify API 
router.get('/recommend/:id', function (req, res) {
  // assume list of playlist track objects
  // need: track id, artist id 
  var playlist = req.body.playlist; // playlist id OR array of songs (basically what playlist tracks returns (kind of))
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
});

module.exports = router;