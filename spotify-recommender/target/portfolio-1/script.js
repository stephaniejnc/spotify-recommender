function navSlideMobile() {
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

// username and (refreshed) OAuth token
// var user = 'arixena';
// var token = '';

// // fetch my user playlists
// fetch('https://api.spotify.com/v1/users/' + user + '/playlists', {
//   headers: {
//   'Authorization': ' Bearer ' + token,
//   'Accept': 'application/json',
//   'Content-Type': 'application/json',
//   },
// }).then(response => {
//   console.log(response.json());
// }).catch(response => {
//   console.log(response.json());
// })


