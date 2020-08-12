// Imports the Google Cloud client library
const {Datastore} = require('@google-cloud/datastore');

async function quickStart() {
  // Your Google Cloud Platform project ID
  const projectId = 'jchiu-sps-summer20';

  // Creates a client
  const datastore = new Datastore({
    projectId: projectId,
  });

  // The kind for the new entity
  const kind = 'Playlist';
  // The name/ID for the new entity
  const name = 'username_playlistname';
  // The Cloud Datastore key for the new entity
  const playlistKey = datastore.key([kind, name]);

  // Prepares the new entity
  const playlist = {
    key: playlistKey,
    data: {
      spotify_id: 'spotify_id',
      owner: 'owner',
      playlist_name: 'playlist_name',
      tracks: ['track1', 'track2'],
      url: 'placeholder-url',
    },
  };

  // Saves the entity
  await datastore.save(playlist);
  console.log(`Saved ${playlist.key.name}: ${playlist.data.owner} playlist`);
}
quickStart().catch(console.error);