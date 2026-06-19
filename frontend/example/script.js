// Bioscope — mobile nav toggle
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('mainNav');

  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('is-open');
    toggle.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Đóng menu khi click vào một liên kết (trên mobile)
  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Đóng menu khi resize lên desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth > 860) {
      nav.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
});

// Hero pause/play toggle (chỉ đổi icon, không có slideshow thật)
document.addEventListener('DOMContentLoaded', function () {
  var pauseBtn = document.querySelector('.hero-pause');
  if (!pauseBtn) return;
  var playing = true;
  pauseBtn.addEventListener('click', function () {
    playing = !playing;
    pauseBtn.innerHTML = playing
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>'
      : '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  });
});
