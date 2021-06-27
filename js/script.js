'use strict';

// type checking
(function () {
  function checkType(value) {
    var regex = /^\[object (\S+?)\]$/;
    var matches = Object.prototype.toString.call(value).match(regex) || [];

    return (matches[1] || 'undefined').toLowerCase();
  }

  window.typeChecking = {
    checkType: checkType
  };
})();

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
          }

          var currentSlider = entry.target.closest('.slider');
          var slides = Array.from(currentSlider.querySelectorAll('.slider__item'));
          var index = slides.indexOf(entry.target.closest('.slider__item'));

          window.slideSwitching.setSlideIndex(index);
          window.slideSwitching.switchArrowVisibility(currentSlider);
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
  var slideIndex;

  setSlideIndex();

  function setSlideIndex(value) {
    slideIndex = value || 0;
  }

  sliders.forEach(function (it) {
    var arrows = Array.from(it.querySelectorAll('.slider__arrow-btn'));
    var arrowNext = it.querySelector('.slider__arrow-btn[data-id="next"]');
    arrowNext.classList.remove('hidden-entity');
    insertEventListeners(it, arrows);
  });

  function insertEventListeners(slider, operand) {
    var isOperandArray = window.typeChecking.checkType(operand) === 'array';

    if (isOperandArray) {
      operand.forEach(function (item) {
        item.addEventListener('click', function (evt) {
          showSlide(slider, evt.target.dataset.id);
        });
      });
    }
  }

  function showSlide(slider, direction) {
    var i = direction === 'previous'
      ? 0
      : 1;

    if (i === 0) {
      plusSlide(slider, -1);
    } else {
      plusSlide(slider, +1);
    }
  }

  function plusSlide(slider, delta) {
    var sliderList = slider.querySelector('.slider__list');
    var slides = Array.from(sliderList.querySelectorAll('.slider__item'));

    if ('IntersectionObserver' in window) {
      var visibleSlides = Array.from(slider.querySelectorAll('.visible'));

      if (visibleSlides.length > 1) {
        return;
      }

      slideIndex = slides.indexOf(visibleSlides[0]);
    }

    slideIndex += delta;
    scrollSlide(slider, sliderList, slides);
  }

  function scrollSlide(slider, sliderList, slides) {
    switchArrowVisibility(slider);

    var scrollPos = slideIndex * (sliderList.scrollWidth / slides.length);
    sliderList.scrollLeft = scrollPos;
  }

  function switchArrowVisibility(slider) {
    var slides = Array.from(slider.querySelectorAll('.slider__item'));
    var arrowPrevious = slider.querySelector('.slider__arrow-btn[data-id="previous"]');
    var arrowNext = slider.querySelector('.slider__arrow-btn[data-id="next"]');

    if (slideIndex === slides.length - 1 || slideIndex > slides.length - 1) {
      arrowNext.classList.add('hidden-entity');
    } else {
      arrowNext.classList.remove('hidden-entity');
    }

    if (slideIndex === 0 || slideIndex < 0) {
      arrowPrevious.classList.add('hidden-entity');
    } else {
      arrowPrevious.classList.remove('hidden-entity');
    }
  }

  window.slideSwitching = {
    setSlideIndex: setSlideIndex,
    switchArrowVisibility: switchArrowVisibility
  };
})();
