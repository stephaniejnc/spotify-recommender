
function loginSpotify() {
    // Get the hash of the url
    const hash = window.location.hash
    .substring(1)
    .split('&')
    .reduce(function (initial, item) {
    if (item) {
        var parts = item.split('=');
        initial[parts[0]] = decodeURIComponent(parts[1]);
    }
    return initial;
    }, {});
    console.log(hash);
    // stash cookie
    // assign a redirect in next line 
    window.location.hash = '';

    // Set token
    let _token = hash.access_token;

    const authEndpoint = 'https://accounts.spotify.com/authorize';

    // Replace with your app's client ID, redirect URI and desired scopes
    const clientId = '2b528ae73678448f8ce4ab753af22e52';
    const redirectUri = 'https://8080-cs-669315281544-default.us-west1.cloudshell.dev/userhome/callback/index.html';
    const scopes = [
    'user-read-birthdate',
    'user-read-email',
    'user-read-private'
    ];

    // If there is no token, redirect to Spotify authorization
    if (!_token) {
    console.log(`${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token`);
    window.location.assign(`${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token`);
    console.log('Redirecting to Spotify login...');
    }

}