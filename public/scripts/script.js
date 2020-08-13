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

// Set token and double check
let access_token = hash.access_token;
let refresh_token = hash.refresh_token;
let user = hash.user;

// Set cookie for 1 hour

function setCookie(cname, cvalue) {
  var d = new Date();
  d.setTime(d.getTime() + 3600 * 1000);
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

// Get cookie

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

// Check cookie

function checkCookie() {
  var username=getCookie("username");
  console.log(username)
  if (username != "") {
    user = username;
    loadPlaylists();
  } else {
      username = user;
      if (username != "" && username != null) {
        console.log(username)
        setCookie("username", user);
        loadPlaylists();
     }
  }
}

// Fetch playlists if needed from URL hash

function loadPlaylists() {
  const app = document.getElementById('root')

  const container = document.createElement('div')
  container.setAttribute('class', 'container')

  const grid = document.createElement('div')
  grid.setAttribute('class', 'grid-row')

  app.append(container)
  app.append(grid)

  // fetch my user playlists
  fetch('/playlists')
  .then(response => {
      if (response.status != 200) {
        console.log(`Error ${response.status}`)
        const h1 = document.createElement('h1')
        h1.textContent = `Error ${response.status}: playlists not retrieved :(`
        app.append(h1)
      }
    return response.json()
  })
  .then(data => {
    console.log('Fetching playlists....')
    console.log(data)
    const h1 = document.createElement('h1')
    const br = document.createElement('br')
    h1.textContent = `${user}'s playlists :)`
    container.appendChild(h1)
    container.append(br)
    data.items.forEach(playlist => {

        // create div with card grid-item and wrapper
        const gridItem = document.createElement('div')
        gridItem.setAttribute('class', 'grid-item')
        const gridItemWrapper = document.createElement('div')
        gridItemWrapper.setAttribute('class', 'grid-item-wrapper')
        gridItem.appendChild(gridItemWrapper)

        // create grid-item container
        const gridItemContainer = document.createElement('div')
        gridItemContainer.setAttribute('class', 'grid-item-container')
        gridItemWrapper.appendChild(gridItemContainer)

        // create grid-item image
        const gridImage = document.createElement('div')
        gridImage.setAttribute('class', 'grid-image-top')
        var playlistImage = playlist.images[0]
        if (playlist.images[0]) {
        gridImage.style.backgroundImage = `url(${playlistImage.url})`
        }
        gridItemContainer.appendChild(gridImage)
        
        // create grid-item content
        const gridContent = document.createElement('div')
        gridContent.setAttribute('class', 'grid-item-content')
        gridItemContainer.appendChild(gridContent)

        // create span and set text to playlist title
        const title = document.createElement('span')
        title.setAttribute('class', 'item-title')
        title.textContent = playlist.name

        // create span and set text to playlist title
        const tracks = document.createElement('span')
        tracks.setAttribute('class', 'item-category')
        tracks.textContent = `${playlist.tracks.total} tracks`

        // create span and set text to playlist description
        const description = document.createElement('span')
        if (playlist.description == "") {
          description.textContent = "no playlist description"
        } else {
        playlist.description = playlist.description.substring(0,25)
        description.textContent = `${playlist.description}...`
        }

        // create span for more info/view playlist
        const viewPlaylist = document.createElement('span')
        viewPlaylist.setAttribute('class', 'more-info')
        viewPlaylist.textContent = "select playlist"

      // append
      gridContent.appendChild(title)
      gridContent.appendChild(tracks)
      gridContent.appendChild(description)
      gridContent.appendChild(viewPlaylist)
      grid.append(gridItem)
    })
  }).catch(err => {
    console.log(err)
    const h1 = document.createElement('h1')
    h1.textContent = `Error ${err.status}: playlists not retrieved, ${err.message} :(`
    app.append(h1)
  })

}