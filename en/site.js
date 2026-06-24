document.addEventListener('DOMContentLoaded', function() {
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function(el) { observer.observe(el); });
  } else {
    reveals.forEach(function(el) { el.classList.add('in'); });
  }

  var hamburger = document.querySelector('.hamburger');
  var nav = document.querySelector('nav');
  var overlay = document.querySelector('.overlay');
  var navLinks = document.querySelectorAll('nav a');

  function toggleMenu() {
    if (!hamburger || !nav || !overlay) return;
    hamburger.classList.toggle('active');
    nav.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
  }

  if (hamburger) hamburger.addEventListener('click', toggleMenu);
  if (overlay) overlay.addEventListener('click', toggleMenu);
  navLinks.forEach(function(link) {
    link.addEventListener('click', function() {
      if (nav && nav.classList.contains('active')) toggleMenu();
    });
  });
});
