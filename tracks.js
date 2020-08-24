const {Datastore} = require('@google-cloud/datastore');

module.exports = function(config) {
    const projectId = 'jchiu-sps-summer20';
    var datastore = new Datastore({
        projectId: projectId,
    });

    function getTracksById(trackId, callback) {
        var query = datastore.createQuery(['Track']);
        datastore.runQuery(query, (err, tracks) => callback(err, tracks, datastore.KEY));
        // var error = null;
        // var tracks = [
        //     {id: 1, title: 'Love Story', artist: ['Taylor Swift']},
        //     {id: 2, title: 'Shake It Off', artist: ['Taylor Swift']},
        //     {id: 3, title: 'The Story Of My Life', artist: ['Niall Horan', 'Zayn Malik', 'Liam Payne', 'Harry Styles', 'Louis Tomlinson']}
        // ]
        // console.log('Tracks for ', playlistId);
        // callback(error, tracks);
    }

    function addTrack(album, artists, audio_feature, name, external_urls, spotify_id, callback) {
        var entity = {
            key: datastore.key('Track'),
            data: {
                album: album,
                artists: artists,
                audio_feature: audio_feature,
                name: name,
                external_urls: external_urls,
                spotify_id: spotify_id
            }
        };

        datastore.save(callback);
    }

    return {
        getTracksById: getTrackById,
        addTrack: addTrack
    };
};