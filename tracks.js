const {Datastore} = require('@google-cloud/datastore');

module.exports = function() {
    const projectId = 'jchiu-sps-summer20';
    var datastore = new Datastore({
        projectId: projectId,
    });

    function getTracksByPlaylist(playlist_id, callback) {
        var query = datastore.createQuery(['Track']).filter('playlist_id', '=', playlist_id);
        datastore.runQuery(query, (err, tracks) => callback(err, tracks, datastore.KEY));
    }

    function addTrack(artists, audio_features, name, track_id, playlist_id, callback) {
        var entity = {
            key: datastore.key('Track'),
            data: {
                artists: artists,
                audio_features: audio_features,
                name: name,
                track_id: track_id,
                playlist_id: playlist_id
            }
        };

        datastore.save(entity, callback);
    }

    function getTrackByTrackId(track_id, callback) {
        var query = datastore.createQuery(['Track']).filter('track_id', '=', track_id);
        datastore.runQuery(query, (err, track) => callback(err, track, datastore.KEY));
    }

    async function getAudioFeaturesById(track_id) {
        console.log('Getting audio features...');
        var query = datastore.createQuery(['Track']).filter('track_id', '=', track_id);
        const returnedTracks = await datastore.runQuery(query);
        var audio_features = returnedTracks[0][0].audio_features;
        console.log('Success!')
        return {audio_features};
    }

    return {
        getTracksByPlaylist: getTracksByPlaylist,
        addTrack: addTrack,
        getTrackByTrackId: getTrackByTrackId,
        getAudioFeaturesById: getAudioFeaturesById
    };
};