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
let access_token = hash.access_token;
let refresh_token = hash.refresh_token;
let user = hash.user;
console.log(access_token);
console.log(user);
console.log(refresh_token);
