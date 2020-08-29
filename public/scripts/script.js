// nav bar burger
function navSlideMobile() {
  console.log("hello");
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".nav-links");
  const navLinks = document.querySelectorAll(".nav-links li")

  // toggle navigation
  if (burger) {
    burger.addEventListener("click", () => {
      nav.classList.toggle("nav-active");

      // animate links
      navLinks.forEach((link, index) => {
          if (link.style.animation) {
              link.style.animation = '';
          } else {
              link.style.animation = `navLinkFade 0.5s ease forwards ${index/7 + 0.5}s`;
          }
          console.log(index / 7);
      });

      // burger animation
      burger.classList.toggle("toggle");
    });
  }   

}

navSlideMobile();

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
let playlist = hash.playlist;
let user = hash.user;

if (window.location.href.indexOf("insights") > -1) {
  fetchInsights();
}

// Set cookie for 1 hour

function setCookie(cname, cvalue) {
  var now = new Date()
  now.setTime(now.getTime() + 3600 * 1000)
  var expires = "expires=" + now.toUTCString()
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
  console.log(`username: ${username}`)
  console.log(access_token)
  if (username != "" && access_token != null) {
    user = username;
    console.log('here')
    loadPlaylists();
  } else {
      username = user;
      if (username != "" && username != null && access_token != null) {
        console.log(username)
        setCookie("username", user);
        loadPlaylists();
     } else if (window.location.href.indexOf("userhome") > -1
               && (username == null || access_token == "undefined")) {
       const app = document.getElementsByClassName('content')[0]

       if (window.location.href.indexOf("userhome") > -1) {
        const h1 = document.createElement('h1')
        h1.textContent = "User home"
        app.appendChild(h1)
       }

       const br = document.createElement('br')
       const h2 = document.createElement('h2')
       h2.textContent = 'Log in to see your playlists and insights!'
       const login = document.createElement('a')
       login.setAttribute('id', 'login')
       const link = document.createTextNode('Login')
       login.appendChild(link)
       login.href = '/login'
       app.appendChild(br)
       app.appendChild(br.cloneNode())
       app.appendChild(h2)
       app.appendChild(br.cloneNode())
       app.appendChild(br.cloneNode())
       app.appendChild(login)
     }
  }
}

async function isLoggedIn() {
  return await fetch('/loginstatus')
  .then(response => {
    if (response.status != 200) {
      console.log(`Error fetching login status.`)
    }
    return response.json()
  })
  .then(isLoggedIn => {
    var loginStatus = isLoggedIn.loggedin
    console.log(loginStatus)
    return loginStatus;
  })
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
        const viewPlaylist = document.createElement('a')
        viewPlaylist.href = `/playlist/?playlist=${playlist.id}&access=${access_token}`
        viewPlaylist.setAttribute('id', 'playlist-id')
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

// fetch personalized user insights 

async function fetchInsights() {
  let loginstatus = await isLoggedIn();

  const app = document.getElementById('root')

  const container = document.createElement('div')
  container.setAttribute('class', 'container')

  const grid = document.createElement('div')
  grid.setAttribute('class', 'grid-row')

  app.append(container)
  app.append(grid)

  console.log(`login status awaited: ${loginstatus}`)

  if (!loginstatus) {
    const app = document.getElementsByClassName('content')[0]
    const h1 = document.createElement('h1')
    h1.textContent = "Insights"
    app.appendChild(h1)
    const br = document.createElement('br')
    const h2 = document.createElement('h2')
    h2.textContent = 'Log in to see your playlists and insights!'
    const login = document.createElement('a')
    login.setAttribute('id', 'login')
    const link = document.createTextNode('Login')
    login.appendChild(link)
    login.href = '/login'
    app.appendChild(br)
    app.appendChild(br.cloneNode())
    app.appendChild(h2)
    app.appendChild(br.cloneNode())
    app.appendChild(br.cloneNode())
    app.appendChild(login)
    return;
  } else {
    fetch('/userinsights') 
    .then(response => {
      if (response.status != 200) {
        console.log(response.status)
      }
      return response.json()
    })
    .then(data => {
    const h1 = document.createElement('h1')
    const br = document.createElement('br')
    h1.textContent = `Your top artists :)`
    container.appendChild(h1)
    container.append(br)
    data.items.forEach(artist => {

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
        var artistImage = artist.images[0]
        if (artist.images[0]) {
        gridImage.style.backgroundImage = `url(${artistImage.url})`
        }
        gridItemContainer.appendChild(gridImage)
        
        // create grid-item content
        const gridContent = document.createElement('div')
        gridContent.setAttribute('class', 'grid-item-content')
        gridItemContainer.appendChild(gridContent)

        // create span and set text to artist name
        const title = document.createElement('span')
        title.setAttribute('class', 'item-title')
        title.textContent = artist.name

        // create span and set text to artist followers
        const tracks = document.createElement('span')
        tracks.setAttribute('class', 'item-category')
        tracks.textContent = `${artist.followers.total} followers`

        // create span and set text to artist's main genre
        const description = document.createElement('span')
        if (artist.genres.length == 0) {
          description.textContent = "no artist genres"
        } else {
          description.textContent = artist.genres[0]
        }

        // create span for more info/view artist
        const viewPlaylist = document.createElement('a')
        viewPlaylist.href = artist.external_urls.spotify
        viewPlaylist.setAttribute('id', 'playlist-id')
        viewPlaylist.setAttribute('class', 'more-info')
        viewPlaylist.textContent = "more info"

        // append
        gridContent.appendChild(title)
        gridContent.appendChild(tracks)
        gridContent.appendChild(description)
        gridContent.appendChild(viewPlaylist)
        grid.append(gridItem)
      })
    })
  }
}

