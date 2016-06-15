'use strict';

var f = document.querySelector('.f');
var s = document.querySelector('.s');
var form = document.querySelector('.form');
var out = document.querySelector('.output');


form.addEventListener('submit', function(e) {
  e.preventDefault();

  var fv = f.value.split('');
  var sv = s.value.split('');

  if (!fv.length || !sv.length) {
    return;
  }

  var fd = document.createElement('div');
  var sd = document.createElement('div');

  for (var i = 0, l = Math.max(fv.length, sv.length); i < l; i++) {
    var fc = fv[i] || '';
    var sc = sv[i] || '';
    var isGood = fc === sc;

    fd.appendChild(createChar(fc, isGood));
    sd.appendChild(createChar(sc, isGood));
  }

  out.innerHTML = '';
  out.appendChild(fd);
  out.appendChild(sd);

});

function createChar(char, isGood) {
  var e = document.createElement('span');
  e.className = 'char ' + (isGood ? 'good' : 'bad');
  e.innerText = char;
  return e;
}
