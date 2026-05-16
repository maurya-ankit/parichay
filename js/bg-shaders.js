(function () {
  'use strict';

  var canvas = document.getElementById('bg-canvas');
  var ctx    = canvas.getContext('2d');
  var W, H;
  var mouse   = { x: -9999, y: -9999 };
  var ripples = [];
  var startTime = performance.now();

  var SPACING      = 18;
  var BASE_R       = 1.5;   // exact match to original dot radius
  var BASE_COLOR   = 200;   // #c8c8c8 = rgb(200,200,200)
  var MOUSE_R      = 100;
  var RIPPLE_SPEED = 260;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('touchmove', function (e) {
    mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('click', function (e) {
    ripples.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    if (ripples.length > 6) ripples.shift();
  });
  window.addEventListener('touchstart', function (e) {
    ripples.push({ x: e.touches[0].clientX, y: e.touches[0].clientY, t: performance.now() });
    if (ripples.length > 6) ripples.shift();
  }, { passive: true });

  function render(now) {
    requestAnimationFrame(render);

    var elapsed = (now - startTime) * 0.001;
    ctx.clearRect(0, 0, W, H);

    ripples = ripples.filter(function (r) { return (now - r.t) * 0.001 < 2.2; });

    var cols = Math.ceil(W / SPACING) + 1;
    var rows = Math.ceil(H / SPACING) + 1;

    for (var row = 0; row < rows; row++) {
      for (var col = 0; col < cols; col++) {
        var x = col * SPACING;
        var y = row * SPACING;

        // mouse: dots near cursor grow slightly and darken
        var mdx = x - mouse.x, mdy = y - mouse.y;
        var md  = Math.sqrt(mdx * mdx + mdy * mdy);
        var mouseInfluence = md < MOUSE_R ? Math.pow(1 - md / MOUSE_R, 2) : 0;

        // slow diagonal breathing wave — very subtle size change only
        var wave = Math.sin(elapsed * 0.9 + (col + row) * 0.4) * 0.5 + 0.5;

        // click ripples
        var rippleInfluence = 0;
        for (var i = 0; i < ripples.length; i++) {
          var r   = ripples[i];
          var age = (now - r.t) * 0.001;
          var rd  = Math.sqrt(Math.pow(x - r.x, 2) + Math.pow(y - r.y, 2));
          var diff = Math.abs(rd - age * RIPPLE_SPEED);
          if (diff < 24) {
            rippleInfluence = Math.max(rippleInfluence,
              Math.pow(1 - diff / 24, 2) * Math.exp(-age * 1.6));
          }
        }

        // radius: base 1.5px, wave adds max 0.4px, mouse/ripple add more
        var radius = BASE_R
          + wave * 0.4
          + mouseInfluence * 2.5
          + rippleInfluence * 2.2;

        // color: base #c8c8c8, darkens toward #888 near mouse/ripple
        var shade = Math.round(BASE_COLOR
          - mouseInfluence * 80
          - rippleInfluence * 70
          - wave * 12);

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgb(' + shade + ',' + shade + ',' + shade + ')';
        ctx.fill();
      }
    }
  }

  resize();
  requestAnimationFrame(render);

}());
