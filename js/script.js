'use strict';

// Lazy loading
(function () {
  var mediaContents = Array.from(document.querySelectorAll('[data-src]'));

  if ('IntersectionObserver' in window) {
    document.addEventListener('DOMContentLoaded', function () {
      function callback(entries) {
        entries.forEach(function (entry) {
          if (entry.target.closest('.slider') && entry.target.closest('li')) {
            entry.target.closest('li').classList.remove('visible');
          }

          if (!entry.isIntersecting) {
            return;
          }

          var lazyContent = entry.target;

          if (lazyContent.dataset.src) {
            lazyContent.src = lazyContent.dataset.src;
            lazyContent.removeAttribute('data-src');
          }

          if (entry.target.closest('.slider') && entry.target.closest('li')) {
            entry.target.closest('li').classList.add('visible');

            var interSection = entry.target;
            var slider = interSection.closest('.slider');
            window.slideSwitchingByDots.highlightDot(null, slider, interSection)();
          }
        });
      }

      var mediaObserver = new IntersectionObserver(callback);

      mediaContents.forEach(function (it) {
        mediaObserver.observe(it);
      });
    });
  } else {
    mediaContents.forEach(function (it) {
      it.setAttribute('src', it.getAttribute('data-src'));
    });
  }
})();

// Slide switching by arrows
(function () {
  var sliders = Array.from(document.querySelectorAll('.slider'));
  var arrowList = null;

  if (!('IntersectionObserver' in window)) {
    sliders.forEach(function (it) {
      if (it.querySelector('.slider__arrows')) {
        arrowList = it.querySelector('.slider__arrows');
        arrowList.classList.add('hidden-entity');
      }
    });
    return;
  }

  sliders.forEach(function (it) {
    if (it.querySelector('.slider__arrows')) {
      arrowList = it.querySelector('.slider__arrows');

      arrowList.addEventListener('click', function (evt) {
        if (evt.target.matches('.slider__arrow-btn')) {
          showSlide(it, evt.target.dataset.id);
        }
      });
    }
  });

  function showSlide(slider, direction) {
    var visibleSlides = slider.querySelectorAll('.visible');

    var i = direction === 'previous'
      ? 0
      : 1;

    if (visibleSlides.length > 1) {
      scrollIt(visibleSlides[i]);
    } else {
      var newSlide = i === 0
        ? visibleSlides[0].previousElementSibling
        : visibleSlides[0].nextElementSibling;

      if (newSlide) {
        scrollIt(newSlide);
      }
    }
  }

  // Variables for the first variant of 'scrollIt' function:
  //   var sliderList = slider.querySelector('.slider__list');
  //   var slides = Array.from(sliderList.querySelectorAll('.slider__item'));

  function scrollIt(slideToShow) {
    // Code of the first 'scrollIt' function variant:
    //   var scrollPos = slides.indexOf(slideToShow) * (sliderList.scrollWidth / slides.length);
    //   sliderList.scrollLeft = scrollPos;

    slideToShow.scrollIntoView({
      behavior: 'smooth'
    });
  }
})();

// Slide switching by dots or thumbnails
(function () {
  var sliders = Array.from(document.querySelectorAll('.slider'));
  var dotList = null;

  sliders.forEach(function (it) {
    if (it.querySelector('.slider__dots')) {
      dotList = it.querySelector('.slider__dots');

      dotList.addEventListener('click', function (evt) {
        if (evt.target.matches('.slider__dot-btn')) {
          scrollIt(evt.target.dataset.id);
          highlightDot(evt, it)();
        }
      });
    }
  });

  function highlightDot(evt, slider, interSection) {
    var currentlyActiveDot = slider.querySelector('.slider__dot-btn.active');
    var nextActiveDot = null;

    return function () {
      currentlyActiveDot.classList.remove('active');

      if (interSection) {
        var dots = Array.from(slider.querySelectorAll('.slider__dot-btn'));
        nextActiveDot = dots.find(function (item) {
          return item.dataset.id === interSection.closest('li').id;
        });
      } else {
        nextActiveDot = evt.target;
      }

      currentlyActiveDot = nextActiveDot;
      currentlyActiveDot.classList.add('active');
    };
  }

  function scrollIt(id) {
    var aim = document.getElementById(id);
    aim.scrollIntoView({
      behavior: 'smooth'
    });
  }

  window.slideSwitchingByDots = {
    highlightDot: highlightDot
  };
})();
