/* ============================================================
   app.js — Ankit Maurya Biodata
   ============================================================ */

const GALLERY = [
  { src: 'img/IMG_4189.JPG', cap: 'Portrait' },
  { src: 'img/IMG_4658.JPG', cap: 'Candid' },
  { src: 'img/IMG_8518.JPG', cap: 'Travels' },
  { src: 'img/IMG_5730.JPG', cap: 'Moments' },
  { src: 'img/IMG_4156.JPG', cap: 'Casual' },
  { src: 'img/IMG_4137.JPG', cap: 'Outdoors' },
  { src: 'img/IMG_4128.JPG', cap: 'With family' },
];

/* ---- Per-member galleries — add photos here as { src, cap } objects ---- */
const MEMBER_GALLERIES = {
  papa:    { label: 'PAPA — MR. VIJAY KUMAR MAURYA', photos: [
      {src: 'img/IMG_6612.JPG', cap: 'Life'},
      { src: 'img/IMG_6579.JPG', cap: 'Life' },
      { src: 'img/IMG_6595.JPG', cap: 'Life' },
      { src: 'img/IMG_6530.JPG', cap: 'Life' },
      { src: 'img/IMG_6493.JPG', cap: 'Life' },
    ] },
  mamma:   { label: 'MAMMA — MRS. SUMITRA MAURYA',  photos: [
      { src: 'img/IMG_6490.JPG', cap: 'Life' },
      { src: 'img/IMG_6610.JPG', cap: 'Life' },
      { src: 'img/IMG_6579.JPG', cap: 'Life' },
      { src: 'img/IMG_6595.JPG', cap: 'Life' },
      { src: 'img/IMG_6530.JPG', cap: 'Life' },
      { src: 'img/IMG_6493.JPG', cap: 'Life' },
    ] },
  brother: { label: 'BHAI — AMIT MAURYA',           photos: [
      { src: 'img/IMG_5191-EDIT.jpg', cap: 'Life' },
      { src: 'img/IMG_5672.JPG', cap: 'Life' },
      { src: 'img/IMG_7573.JPG', cap: 'Life' },
    ] },
  sister:  { label: 'DIDI — MADHURI MAURYA',         photos: [
      { src: 'img/IMG_3521.jpg', cap: 'Life' },
      { src: 'img/IMG_3589.jpg', cap: 'Life' },
      { src: 'img/IMG_7550.JPG', cap: 'Life' },
    ] },
};

var currentGallery      = GALLERY;
var currentGalleryLabel = 'PHOTO GALLERY';

/* ---- Family tree collapse / expand ---- */
function toggleFamily(id) {
  const group   = document.getElementById(id);
  const content = document.getElementById(id + '-content');
  const btn     = group ? group.querySelector('.gen-toggle') : null;
  const icon    = btn   ? btn.querySelector('.gen-toggle__icon') : null;

  if (!group || !content || !btn || !icon) return;

  const isOpen = content.style.maxHeight && content.style.maxHeight !== '0px';

  if (isOpen) {
    content.style.maxHeight = '0';
    icon.textContent = '+';
    btn.setAttribute('aria-expanded', 'false');
    content.setAttribute('aria-hidden', 'true');
  } else {
    content.style.maxHeight = content.scrollHeight + 'px';
    icon.textContent = '−';
    btn.setAttribute('aria-expanded', 'true');
    content.setAttribute('aria-hidden', 'false');
  }
}

/* ================================================================
   HERO SLIDESHOW — crossfade through all gallery images
   ================================================================ */
var heroIndex = 0;

function initHeroSlideshow() {
  var img = document.querySelector('.hero__img');
  if (!img) return;

  // Preload all images silently
  GALLERY.forEach(function (g) {
    var p = new Image();
    p.src = g.src;
  });

  setInterval(function () {
    img.style.opacity = '0';
    setTimeout(function () {
      heroIndex = (heroIndex + 1) % GALLERY.length;
      img.style.transition = 'none';       // swap src with no transition (at opacity 0)
      img.src = GALLERY[heroIndex].src;
      img.alt = GALLERY[heroIndex].cap;
      void img.offsetHeight;               // force reflow so src paint is committed
      img.style.transition = 'opacity 0.68s ease';
      img.style.opacity = '1';
    }, 780);
  }, 2400);
}

/* ================================================================
   STACKED CARD GALLERY
   ================================================================ */
var cardIndex     = 0;
var cardAnimating = false;
var isDragging    = false;
var dragStartX    = 0;
var dragCurrentX  = 0;

/* Position descriptors: 0 = front card, 1 = second, etc. */
function _cardPos(pos) {
  var p = [
    { t: 'translate(0,0) rotate(0deg) scale(1)',             o: '1',    z: '10' },
    { t: 'translate(9px,15px) rotate(2.8deg) scale(0.94)',   o: '0.76', z: '9'  },
    { t: 'translate(17px,28px) rotate(5.5deg) scale(0.88)',  o: '0.52', z: '8'  },
    { t: 'translate(24px,39px) rotate(8deg) scale(0.82)',    o: '0.28', z: '7'  },
  ];
  return p[pos] || { t: 'translate(30px,48px) rotate(10deg) scale(0.76)', o: '0', z: '6' };
}

function _renderDeck() {
  var deck = document.getElementById('card-deck');
  if (!deck) return;
  deck.innerHTML = '';

  var ctr = document.getElementById('card-counter');

  /* Empty state for member galleries with no photos yet */
  if (currentGallery.length === 0) {
    var empty = document.createElement('div');
    empty.className = 'card-gallery__empty';
    empty.innerHTML =
      '<div class="card-gallery__empty-icon">&#128247;</div>' +
      '<p class="card-gallery__empty-text">No photos added yet</p>';
    deck.appendChild(empty);
    if (ctr) ctr.textContent = '— / —';
    return;
  }

  var count = Math.min(4, currentGallery.length);
  for (var i = count - 1; i >= 0; i--) {
    var idx = (cardIndex + i) % currentGallery.length;
    var g   = currentGallery[idx];
    var s   = _cardPos(i);

    var card = document.createElement('div');
    card.className = 'card-gallery__card';
    card.setAttribute('data-pos', i);
    card.style.cssText =
      'transform:' + s.t + ';' +
      'opacity:' + s.o + ';' +
      'z-index:' + s.z + ';' +
      'transition:transform 0.42s cubic-bezier(0.25,0.46,0.45,0.94),opacity 0.42s;';

    card.innerHTML =
      '<img src="' + g.src + '" alt="' + g.cap + '" draggable="false">' +
      '<p class="card-gallery__cap">' + g.cap.toUpperCase() + '</p>';

    deck.appendChild(card);
  }

  if (ctr) ctr.textContent = (cardIndex + 1) + ' / ' + currentGallery.length;
}

function _blockScroll(e) { e.preventDefault(); }

function openCardGallery(startIndex, gallery, label) {
  currentGallery      = gallery || GALLERY;
  currentGalleryLabel = label  || 'PHOTO GALLERY';

  var titleEl = document.getElementById('card-gallery-title');
  if (titleEl) titleEl.textContent = currentGalleryLabel;

  cardIndex = currentGallery.length > 0
    ? ((startIndex % currentGallery.length) + currentGallery.length) % currentGallery.length
    : 0;

  _renderDeck();
  var el = document.getElementById('card-gallery');
  if (!el) return;
  el.classList.add('is-open');
  el.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  document.addEventListener('touchmove', _blockScroll, { passive: false });
  document.getElementById('card-gallery-close').focus();
}

function openMemberGallery(memberId) {
  var member = MEMBER_GALLERIES[memberId];
  if (!member) return;
  openCardGallery(0, member.photos, member.label);
}

function closeCardGallery() {
  var el = document.getElementById('card-gallery');
  if (!el) return;
  el.classList.remove('is-open');
  el.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  document.removeEventListener('touchmove', _blockScroll, { passive: false });
}

function nextCard() {
  if (cardAnimating) return;
  cardAnimating = true;

  // Fly front card off to the left
  var front = document.querySelector('#card-deck [data-pos="0"]');
  if (front) {
    front.style.transition = 'transform 0.34s ease, opacity 0.34s ease';
    front.style.transform  = 'translate(-145%, -8px) rotate(-18deg) scale(0.85)';
    front.style.opacity    = '0';
  }

  // Shift remaining cards one position forward
  var others = document.querySelectorAll('#card-deck [data-pos]:not([data-pos="0"])');
  others.forEach(function (card) {
    var p = parseInt(card.getAttribute('data-pos')) - 1;
    var s = _cardPos(p);
    card.style.transition = 'transform 0.34s ease, opacity 0.34s ease';
    card.style.transform  = s.t;
    card.style.opacity    = s.o;
  });

  setTimeout(function () {
    cardIndex = (cardIndex + 1) % currentGallery.length;
    _renderDeck();
    cardAnimating = false;
  }, 360);
}

function prevCard() {
  if (cardAnimating) return;
  cardAnimating = true;

  cardIndex = (cardIndex - 1 + currentGallery.length) % currentGallery.length;
  _renderDeck();

  // Animate new front card in from the right
  var front = document.querySelector('#card-deck [data-pos="0"]');
  if (front) {
    front.style.transition = 'none';
    front.style.transform  = 'translate(145%, -8px) rotate(18deg) scale(0.85)';
    front.style.opacity    = '0';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        front.style.transition = 'transform 0.42s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.42s';
        var s = _cardPos(0);
        front.style.transform  = s.t;
        front.style.opacity    = s.o;
        setTimeout(function () { cardAnimating = false; }, 430);
      });
    });
  } else {
    cardAnimating = false;
  }
}

/* ---- Toast helper ---- */
function showToast(text, durationMs) {
  var t = document.createElement('div');
  t.className   = 'toast';
  t.textContent = text;
  document.body.appendChild(t);
  setTimeout(function () {
    t.style.transition = 'opacity 0.4s';
    t.style.opacity    = '0';
    setTimeout(function () { t.remove(); }, 400);
  }, durationMs || 2800);
}

/* ---- Expose to global scope for inline onclick handlers ---- */
window.toggleFamily    = toggleFamily;
window.openCardGallery = openCardGallery;

/* ================================================================
   INIT
   ================================================================ */
document.addEventListener('DOMContentLoaded', function () {

  /* Open parents + siblings sections on load */
  ['parents', 'siblings'].forEach(function (id) {
    var content = document.getElementById(id + '-content');
    var group   = document.getElementById(id);
    var btn     = group ? group.querySelector('.gen-toggle') : null;
    if (!content || !btn) return;

    content.style.maxHeight = content.scrollHeight + 'px';
    content.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
  });

  /* Hero slideshow + click to open gallery */
  initHeroSlideshow();
  var heroFrame = document.getElementById('hero-img-frame');
  if (heroFrame) {
    heroFrame.addEventListener('click', function () { openCardGallery(heroIndex); });
    heroFrame.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCardGallery(heroIndex); }
    });
  }

  /* Polaroids + self-node: [data-gallery="N"] → openCardGallery(N) */
  document.querySelectorAll('[data-gallery]').forEach(function (el) {
    var idx = parseInt(el.getAttribute('data-gallery'), 10);
    el.addEventListener('click', function () { openCardGallery(idx); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCardGallery(idx); }
    });
  });

  /* Family member node cards → member-specific gallery */
  document.querySelectorAll('[data-member]').forEach(function (el) {
    var memberId = el.getAttribute('data-member');
    el.addEventListener('click', function () { openMemberGallery(memberId); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openMemberGallery(memberId); }
    });
  });


  /* Card gallery — close button */
  var cgClose = document.getElementById('card-gallery-close');
  if (cgClose) cgClose.addEventListener('click', closeCardGallery);

  /* Card gallery — prev / next buttons */
  var cgPrev = document.getElementById('card-gallery-prev');
  var cgNext = document.getElementById('card-gallery-next');
  if (cgPrev) cgPrev.addEventListener('click', prevCard);
  if (cgNext) cgNext.addEventListener('click', nextCard);

  /* Card gallery — close on backdrop */
  var cgEl = document.getElementById('card-gallery');
  if (cgEl) {
    cgEl.addEventListener('click', function (e) {
      if (e.target === cgEl) closeCardGallery();
    });
  }

  /* ---- Mouse drag ---- */
  document.addEventListener('mousedown', function (e) {
    if (cardAnimating) return;
    var front = document.querySelector('#card-deck [data-pos="0"]');
    if (!front || !front.contains(e.target)) return;
    e.preventDefault();
    isDragging   = true;
    dragStartX   = e.clientX;
    dragCurrentX = e.clientX;
    front.style.transition = 'none';
    front.style.cursor     = 'grabbing';
  });

  document.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    var front = document.querySelector('#card-deck [data-pos="0"]');
    if (!front) return;
    dragCurrentX = e.clientX;
    var dx  = dragCurrentX - dragStartX;
    var rot = dx * 0.06;
    var vy  = Math.abs(dx) * 0.055;
    var op  = Math.max(0.18, 1 - Math.abs(dx) / 270);
    front.style.transform = 'translate(' + dx + 'px,' + vy + 'px) rotate(' + rot + 'deg) scale(1)';
    front.style.opacity   = op;
  });

  document.addEventListener('mouseup', function () {
    if (!isDragging) return;
    isDragging = false;
    var front = document.querySelector('#card-deck [data-pos="0"]');
    if (!front) return;
    front.style.cursor = 'grab';
    var dx = dragCurrentX - dragStartX;
    if (Math.abs(dx) > 80) {
      if (dx < 0) nextCard(); else prevCard();
    } else {
      front.style.transition = 'transform 0.32s ease, opacity 0.32s ease';
      var s = _cardPos(0);
      front.style.transform  = s.t;
      front.style.opacity    = s.o;
    }
  });

  /* ---- Touch drag ---- */
  document.addEventListener('touchstart', function (e) {
    if (cardAnimating) return;
    var front = document.querySelector('#card-deck [data-pos="0"]');
    if (!front || !front.contains(e.target)) return;
    isDragging   = true;
    dragStartX   = e.touches[0].clientX;
    dragCurrentX = dragStartX;
    front.style.transition = 'none';
  }, { passive: true });

  document.addEventListener('touchmove', function (e) {
    if (!isDragging) return;
    var front = document.querySelector('#card-deck [data-pos="0"]');
    if (!front) return;
    dragCurrentX = e.touches[0].clientX;
    var dx  = dragCurrentX - dragStartX;
    var rot = dx * 0.06;
    var vy  = Math.abs(dx) * 0.055;
    var op  = Math.max(0.18, 1 - Math.abs(dx) / 270);
    front.style.transform = 'translate(' + dx + 'px,' + vy + 'px) rotate(' + rot + 'deg) scale(1)';
    front.style.opacity   = op;
  }, { passive: true });

  document.addEventListener('touchend', function () {
    if (!isDragging) return;
    isDragging = false;
    var front = document.querySelector('#card-deck [data-pos="0"]');
    if (!front) return;
    var dx = dragCurrentX - dragStartX;
    if (Math.abs(dx) > 70) {
      if (dx < 0) nextCard(); else prevCard();
    } else {
      front.style.transition = 'transform 0.32s ease, opacity 0.32s ease';
      var s = _cardPos(0);
      front.style.transform  = s.t;
      front.style.opacity    = s.o;
    }
  });

  /* ---- Keyboard navigation ---- */
  document.addEventListener('keydown', function (e) {
    var el = document.getElementById('card-gallery');
    if (!el || !el.classList.contains('is-open')) return;
    if (e.key === 'Escape')     closeCardGallery();
    if (e.key === 'ArrowLeft')  prevCard();
    if (e.key === 'ArrowRight') nextCard();
  });

});
