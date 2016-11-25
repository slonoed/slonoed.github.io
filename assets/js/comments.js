// Initialize Firebase
var config = {
    apiKey: "AIzaSyAE0z58tWTVwmK3c--_yr9BJduKbGodZKI",
    authDomain: "blog-ed695.firebaseapp.com",
    databaseURL: "https://blog-ed695.firebaseio.com",
    storageBucket: "blog-ed695.appspot.com",
    messagingSenderId: "205896244724"
  };
firebase.initializeApp(config);

var database = firebase.database();
var ref = database.ref('comments/' + PAGE_ID.replace('/', '') + '/');
var form = document.getElementById('add_comment');

form.addEventListener('submit', function(e) {
  e.preventDefault();
  var nEl = form.querySelector('#name')
  var tEl = form.querySelector('#comment')
  var btn = form.querySelector('#submit')
  var name = nEl.value;
  var text = tEl.value;

  btn.setAttribute('disabled', 'disabled');
  nEl.setAttribute('disabled', 'disabled');
  tEl.setAttribute('disabled', 'disabled');

  var clear = function() {
    btn.removeAttribute('disabled');
    nEl.removeAttribute('disabled');
    tEl.removeAttribute('disabled');
  }

  ref.push().set({
    name: name,
    text: text,
    posted: firebase.database.ServerValue.TIMESTAMP
  }).then(function(a) {
    nEl.value = '';
    tEl.value = '';
    clear();
    appendComment({ name: name, text: text, posted: Date.now() });
  }).catch(function() {
    clear();
  });
});

ref.once('value', function(snapshot) {
  var comments = snapshot.val();
  var node = document.getElementById('comments');
  node.innerHTML = '';

  if (!comments) {
    return;
  }

  Object.keys(comments).forEach(function(k) {
    var d = comments[k];
    appendComment(d);
  });
})

function formatTs(ts) {
  var d = new Date(ts);
  return d.toString();
}

function appendComment(d) {
  var node = document.getElementById('comments');
  var c = document.createElement('div');
  c.className="comment";

  var insert = function(cls, text) {
    var n = document.createElement('div');
    n.className = 'comment__' + cls;
    n.textContent = text;
    c.appendChild(n);
  };

  insert('name', d.name + ' wrote:');
  insert('text', d.text);
  insert('posted', formatTs(d.posted));

  node.appendChild(c);
}
