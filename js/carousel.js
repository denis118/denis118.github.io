'use strict';

//
// utility
//

(function () {
  // random integer
  var getRandomIntInclusive = function (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };


  // monade
  var Maybe = function (operand) {
    this.operand = operand;
  };

  Maybe.prototype.map = function (operator) {
    if (this.operand && operator) {
      return new Maybe(operator(this.operand));
    } else {
      return new Maybe(null);
    }
  };


  // export
  window.utility = {
    getRandomIntInclusive: getRandomIntInclusive,
    Maybe: Maybe
  };
})();

//
// carousel
//

(function () {
  var MIN = 0;
  var MAX = 999999;
  var UNITS = 'px';

  var initCarousel = function (rootElement) {
    var that = {};

    that.activate = function () {
      var _ = this;

      _.root = rootElement;
      _.inner = _.root.querySelector('.carousel__inner');
      _.carouselList = _.root.querySelector('.carousel__list');
      _.slides = Array.from(_.root.querySelectorAll('.carousel__item'));

      _.slides.forEach(function (slide) {
        _.indexSlide(slide);
        _.hideImage(slide);
      });

      _.hideScrollbar();
      _.insertArrows(_);
      _.insertDots(_);

      return _;
    };

    that.execute = function (selector, functions) {
      var _ = this;

      _.root.querySelectorAll(selector).forEach(function (it) {
        functions.forEach(function (func) {
          func(it);
        });
      });
    };

    that.indexSlide = function (slide) {
      slide.setAttribute('data-index', window.utility.getRandomIntInclusive(MIN, MAX));
    };

    that.hideImage = function (slide) {
      var workOn = function (array) {
        var selector = array[0];
        var attribute = array[1];
        var dataAttribute = array[2];

        slide.querySelectorAll(selector).forEach(function (it) {
          it.setAttribute(dataAttribute, it.getAttribute(attribute));
          it.removeAttribute(attribute);
        });
      };

      [
        ['img[src]', 'src', 'data-src'],
        ['img[srcset]', 'srcset', 'data-srcset'],
        ['source[srcset]', 'srcset', 'data-srcset']
      ].forEach(function (array) {
        workOn(array);
      });
    };

    that.hideScrollbar = function () {
      var _ = this;

      if (!_.inner.classList.contains('.carousel__inner--js')) {
        _.inner.classList.add('carousel__inner--js');
      }

      _.inner.style.height = _.root
          .querySelector('.carousel__item')
          .scrollHeight + UNITS;
    };

    that.insertArrows = function (_) {
      var fragment = document.createDocumentFragment();

      var arrows = document
          .querySelector('#carousel-arrows')
          .content
          .cloneNode(true);

      fragment.appendChild(arrows);
      _.root.appendChild(fragment);

      _.buttonPrevious = _.root.querySelector('.carousel__arrow-btn--previous');
      _.buttonNext = _.root.querySelector('.carousel__arrow-btn--next');
    };

    that.insertDots = function (_) {
      var fragment = document.createDocumentFragment();

      var block = document.createElement('div');
      block.setAttribute('class', 'carousel__dots');

      _.slides.forEach(function (slide) {
        var slideIndex = slide.getAttribute('data-index');
        var slideName = slide.getAttribute('data-name');

        var dotButton = document.createElement('button');
        var attributes = {
          'class': 'carousel__dot-btn',
          'type': 'button',
          'data-index': slideIndex,
          'aria-label': 'Кнопка для перехода к слайду ' + slideName
        };

        Object.keys(attributes).forEach(function (key) {
          dotButton.setAttribute(key, attributes[key]);
        });

        block.appendChild(dotButton);
      });

      fragment.appendChild(block);
      _.root.appendChild(fragment);
    };

    that.manageArrowsVisibility = function () {
      var _ = this;

      var activeSlide = _.root.querySelector('.carousel__item.active');
      var isPreviousSlideExisting = activeSlide.previousElementSibling
        ? true
        : false;

      if (!isPreviousSlideExisting) {
        _.buttonPrevious.classList.add('hidden-entity');
      } else {
        _.buttonPrevious.classList.remove('hidden-entity');
      }

      var isNextSlideExisting = activeSlide.nextElementSibling
        ? true
        : false;

      if (!isNextSlideExisting) {
        _.buttonNext.classList.add('hidden-entity');
      } else {
        _.buttonNext.classList.remove('hidden-entity');
      }
    };

    that.highlightDot = function () {
      var _ = this;

      var activeSlide = _.root.querySelector('.carousel__item.active');
      var activeIndex = activeSlide.getAttribute('data-index');

      _.execute('.carousel__dot-btn', [function (dot) {
        dot.classList.remove('active');

        var dotIndex = dot.getAttribute('data-index');
        if (dotIndex === activeIndex) {
          dot.classList.add('active');
        }
      }]);
    };

    that.scrollIt = function (_, slideToShow) {
      var scrollPos = _.slides.indexOf(slideToShow) * (_.carouselList.scrollWidth / _.slides.length);
      _.carouselList.scrollLeft = scrollPos;
    };

    that.onButtonPreviousClick = function (evt) {
      if (!evt.target.matches('.carousel__arrow-btn')) {
        return;
      }

      var _ = that;

      var activeSlide = _.root.querySelector('.carousel__item.active');

      var previousSlide = activeSlide.previousElementSibling
        ? activeSlide.previousElementSibling
        : null;

      if (previousSlide) {
        _.scrollIt(_, previousSlide);

        activeSlide.classList.remove('active');
        previousSlide.classList.add('active');
      }
    };

    that.onButtonNextClick = function (evt) {
      if (!evt.target.matches('.carousel__arrow-btn')) {
        return;
      }

      var _ = that;

      var activeSlide = _.root.querySelector('.carousel__item.active');

      var nextSlide = activeSlide.nextElementSibling
        ? activeSlide.nextElementSibling
        : null;

      if (nextSlide) {
        _.scrollIt(_, nextSlide);

        activeSlide.classList.remove('active');
        nextSlide.classList.add('active');
      }
    };

    that.onDotsClick = function (evt) {
      if (!evt.target.matches('.carousel__dot-btn')) {
        return;
      }

      var _ = that;

      var dataIndex = evt.target.getAttribute('data-index');
      var slideToShow = _.root.querySelector('.carousel__item[data-index="' + dataIndex + '"]');

      _.scrollIt(_, slideToShow);
    };

    that.setEventListeners = function () {
      var _ = this;

      _.root
          .querySelector('.carousel__dots')
          .addEventListener('click', _.onDotsClick);

      _.buttonPrevious.addEventListener('click', _.onButtonPreviousClick);
      _.buttonNext.addEventListener('click', _.onButtonNextClick);
    };

    that.eraseEventListeners = function () {
      var _ = this;

      _.root
          .querySelector('.carousel__dots')
          .removeEventListener('click', _.onDotsClick);

      _.buttonPrevious.removeEventListener('click', _.onButtonPreviousClick);
      _.buttonNext.removeEventListener('click', _.onButtonNextClick);
    };

    return that;
  };

  var carousels = null;
  window.carousel = {};

  var findCarousels = function () {
    var Maybe = window.utility.Maybe;
    carousels = new Maybe(document.querySelectorAll('.carousel'));
    carousels = carousels.operand.length
      ? Array.from(carousels.operand)
      : null;
  };

  findCarousels();

  if (carousels.length) {
    carousels.forEach(function (it) {
      var carousel = initCarousel(it);
      carousel.activate().setEventListeners();
      window.carousel[carousel.root.id] = carousel;
    });

    var createWindowEventsHandler = function (method) {
      return function () {
        Object.keys(window.carousel).forEach(function (key) {
          window.carousel[key][method]();
        });
      };
    };

    var onWindowResize = createWindowEventsHandler('hideScrollbar');
    var onWindowBeforeunload = createWindowEventsHandler('eraseEventListeners');

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('beforeunload', onWindowBeforeunload);
  }
})();

//
// Lazy loading
//

(function () {
  var mediaContents = document.querySelectorAll('[data-src], [data-srcset]');

  if ('IntersectionObserver' in window) {
    document.addEventListener('DOMContentLoaded', function () {
      var callback = function (entries) {
        entries.forEach(function (entry) {
          if (entry.target.closest('.carousel') && entry.target.closest('li')) {
            entry.target.closest('li').classList.remove('active');
          }

          if (!entry.isIntersecting) {
            return;
          }

          var lazyContent = entry.target;

          if (lazyContent.dataset.src) {
            lazyContent.src = lazyContent.dataset.src;
            lazyContent.removeAttribute('data-src');
          }

          if (lazyContent.dataset.srcset) {
            lazyContent.srcset = lazyContent.dataset.srcset;
            lazyContent.removeAttribute('data-srcset');
          }

          if (entry.target.closest('.carousel') && entry.target.closest('li')) {
            entry.target.closest('li').classList.add('active');

            var id = entry.target.closest('.carousel').getAttribute('id');
            window.carousel[id].highlightDot();
            window.carousel[id].manageArrowsVisibility();
          }
        });
      };

      var options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
      };

      var mediaObserver = new IntersectionObserver(callback, options);

      mediaContents.forEach(function (it) {
        mediaObserver.observe(it);
      });
    });
  } else {
    mediaContents.forEach(function (it) {
      it.setAttribute('srcset', it.getAttribute('data-srcset'));

      if (it.tagName && it.tagName === 'IMG') {
        it.setAttribute('src', it.getAttribute('data-src'));
      }
    });

    document.querySelectorAll('.carousel').forEach(function (item) {
      var dots = item.querySelectorAll('.carousel__dot-btn');

      dots.forEach(function (dot) {
        dot.setAttribute('style', 'visibility: hidden; pointer-events: none;');
        dot.setAttribute('aria-hidden', 'true');
        dot.setAttribute('tabindex', '-1');
      });
    });
  }
})();
