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
// slider
//

(function () {
  var MIN = 0;
  var MAX = 999999;
  var UNITS = 'px';
  var START_INDEX = 0;

  var initSlider = function (rootElement) {
    var that = {};

    that.activate = function () {
      var _ = that;

      _.root = rootElement;
      _.inner = _.root.querySelector('.slider__inner');
      _.sliderList = _.root.querySelector('.slider__list');
      _.slides = Array.from(_.root.querySelectorAll('.slider__item'));
      _.slideIndex = START_INDEX;
      _.cursorPosition = {};

      if (!_.root.classList.contains('.slider--js')) {
        _.root.classList.add('slider--js');
      }

      _.slides.forEach(function (slide) {
        _.indexSlide(slide);
      });

      _.hideScrollbar();
      _.insertNumbers();
      _.insertArrows(_);
      _.insertDots(_);

      return _;
    };

    that.execute = function (selector, functions) {
      var _ = that;

      _.root.querySelectorAll(selector).forEach(function (it) {
        functions.forEach(function (func) {
          func(it);
        });
      });
    };

    that.indexSlide = function (slide) {
      slide.setAttribute('data-index', window.utility.getRandomIntInclusive(MIN, MAX));
    };

    that.hideScrollbar = function () {
      var _ = that;

      if (!_.inner.classList.contains('.slider__inner--js')) {
        _.inner.classList.add('slider__inner--js');
      }

      _.inner.style.height = _.root
          .querySelector('.slider__item')
          .scrollHeight + UNITS;
    };

    that.insertArrows = function (_) {
      var fragment = document.createDocumentFragment();

      var arrows = document
          .querySelector('#slider-arrows')
          .content
          .cloneNode(true);

      fragment.appendChild(arrows);
      _.root.appendChild(fragment);

      _.buttonPrevious = _.root.querySelector('.slider__arrow--previous');
      _.buttonNext = _.root.querySelector('.slider__arrow--next');
    };

    that.insertDots = function (_) {
      var fragment = document.createDocumentFragment();

      var block = document.createElement('div');
      block.setAttribute('class', 'slider__dots');

      _.slides.forEach(function (slide) {
        var slideIndex = slide.getAttribute('data-index');
        var slideName = slide.getAttribute('data-name');

        var dotButton = document.createElement('button');
        var attributes = {
          'class': 'slider__dot-btn',
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

      _.highlightDot();
    };

    that.insertNumbers = function () {
      var _ = that;

      var fragment = document.createDocumentFragment();

      var numbers = document
          .querySelector('#slider-numbers')
          .content
          .cloneNode(true);

      fragment.appendChild(numbers);
      _.root.appendChild(fragment);

      _.root
          .querySelector('.slider__slides-quantity')
          .innerText = _.slides.length;

      _.activeSlideNumber = _.root.querySelector('.slider__current-number');

      _.manageNumbers();
    };

    that.manageNumbers = function () {
      var _ = that;

      var activeSlides = _.root.querySelectorAll('.slider__item.active');
      var activeSlide = activeSlides[0];

      _.activeSlideNumber.innerText = _.slides.indexOf(activeSlide) + 1;
    };

    that.highlightDot = function () {
      var _ = that;

      var activeSlide = _.root.querySelector('.slider__item.active');
      var activeIndex = activeSlide.getAttribute('data-index');

      _.execute('.slider__dot-btn', [function (dot) {
        dot.classList.remove('active');

        var dotIndex = dot.getAttribute('data-index');
        if (dotIndex === activeIndex) {
          dot.classList.add('active');
        }
      }]);
    };

    that.showNextSlide = function (previous) {
      var _ = that;

      _.slides[_.slideIndex].setAttribute('class', 'slider__item');

      if (previous) {
        _.slideIndex = (--_.slideIndex) % _.slides.length;

        if (_.slideIndex < 0) {
          _.slideIndex += _.slides.length;
        }
      } else {
        _.slideIndex = (++_.slideIndex) % _.slides.length;
      }

      _.slides[_.slideIndex].setAttribute('class', 'slider__item active');

      _.highlightDot();
      _.manageNumbers();
    };

    that.onArrowClick = function (evt) {
      if (!evt.target.matches('.slider__arrow')) {
        return;
      }

      var _ = that;

      if (evt.target.matches('.slider__arrow--previous')) {
        _.showNextSlide(true);
      }

      if (evt.target.matches('.slider__arrow--next')) {
        _.showNextSlide();
      }
    };

    that.onSliderTouchstart = function (evt) {
      evt.preventDefault();
      that.cursorPosition.clientX1 = evt.touches[0].clientX;
    };

    that.onSliderTouchend = function (evt) {
      var _ = that;

      evt.preventDefault();
      _.cursorPosition.clientX2 = evt.changedTouches[0].clientX;

      var clientX1 = _.cursorPosition.clientX1;
      var clientX2 = _.cursorPosition.clientX2;

      if (clientX1 - clientX2 === 0) {
        return;
      }

      if (clientX1 - clientX2 < 0) {
        _.showNextSlide(true);
      }

      if (clientX1 - clientX2 > 0) {
        _.showNextSlide();
      }
    };

    that.onDotsClick = function (evt) {
      if (!evt.target.matches('.slider__dot-btn')) {
        return;
      }

      var _ = that;

      var dataIndex = evt.target.getAttribute('data-index');
      var slideToShow = _.root.querySelector('.slider__item[data-index="' + dataIndex + '"]');
      var activeSlide = _.root.querySelector('.slider__item.active');

      activeSlide.classList.remove('active');
      slideToShow.classList.add('active');

      _.slideIndex = _.slides.indexOf(slideToShow);

      _.highlightDot();
      _.manageNumbers();
    };

    that.processMouse = function (evt) {
      if (evt.target.matches('.slider__arrow')) {
        that.onArrowClick(evt);
      } else if (evt.target.matches('.slider__dot-btn')) {
        that.onDotsClick(evt);
      }
    };

    that.onSliderPointerup = function (evt) {
      switch (evt.pointerType) {
        case 'mouse':
        case 'touch':
          that.processMouse(evt);
          break;
        default:
          return;
      }
    };

    that.setEventListeners = function () {
      var _ = that;

      _.root.addEventListener('pointerup', _.onSliderPointerup);
      _.root.addEventListener('touchstart', _.onSliderTouchstart);
      _.root.addEventListener('touchend', _.onSliderTouchend);
    };

    that.eraseEventListeners = function () {
      var _ = that;

      _.root.removeEventListener('pointerup', _.onSliderPointerup);
      _.root.removeEventListener('touchstart', _.onSliderTouchstart);
      _.root.removeEventListener('touchend', _.onSliderTouchend);
    };

    return that;
  };

  var sliders = null;
  window.slider = {};

  var findSliders = function () {
    var Maybe = window.utility.Maybe;
    sliders = new Maybe(document.querySelectorAll('.slider'));
    sliders = sliders.operand.length
      ? Array.from(sliders.operand)
      : null;
  };

  findSliders();

  if (sliders.length) {
    sliders.forEach(function (it) {
      var slider = initSlider(it);
      slider.activate().setEventListeners();
      window.slider[slider.root.id] = slider;
    });

    var createWindowEventsHandler = function (method) {
      return function () {
        Object.keys(window.slider).forEach(function (key) {
          window.slider[key][method]();
        });
      };
    };

    var onWindowResize = createWindowEventsHandler('hideScrollbar');
    var onWindowBeforeunload = createWindowEventsHandler('eraseEventListeners');

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('beforeunload', onWindowBeforeunload);
  }
})();


// (function () {
//   var START_INDEX = 0;

//   var sliders;
//   var listenersKeeping = {};

//   document.addEventListener('DOMContentLoaded', function () {
//     findSliders();

//     if (sliders) {
//       setEventListeners();
//     }
//   });

//   function findSliders() {
//     var Maybe = window.monad.Maybe;
//     sliders = new Maybe(document.querySelectorAll('.slider'));
//     sliders = sliders.operand.length
//       ? Array.from(sliders.operand)
//       : null;
//   }

//   function setEventListeners() {
//     sliders.forEach(function (it) {
//       var onSliderClick = (function () {
//         var index = START_INDEX;

//         return function (evt) {
//           if (!evt.target.matches('.slider__arrow')) {
//             return;
//           }

//           var slider = evt.target.closest('.slider')
//             ? evt.target.closest('.slider')
//             : null;

//           if (!slider) {
//             return;
//           }

//           var slides = Array.from(slider.querySelectorAll('.slider__item'));
//           slides[index].setAttribute('class', 'slider__item');

//           if (evt.target.matches('.slider__arrow--previous')) {
//             index = (--index) % slides.length;

//             if (index < 0) {
//               index += slides.length;
//             }
//           }

//           if (evt.target.matches('.slider__arrow--next')) {
//             index = (++index) % slides.length;
//           }

//           slides[index].setAttribute('class', 'slider__item active');
//         };
//       })();

//       it.addEventListener('click', onSliderClick);

//       listenersKeeping[it.id] = onSliderClick;
//     });
//   }

//   function eraseEventListeners() {
//     sliders.forEach(function (it) {
//       var onSliderClick = listenersKeeping[it.id];
//       it.removeEventListener('click', onSliderClick);
//     });
//   }

//   window.addEventListener('beforeunload', eraseEventListeners);
// })();


//
// primitive slider with transform and transition
//

// (function () {
//   var START_INDEX = 0;
//   var PERCENT_SIGN = '%';

//   var slider = document.querySelector('.slider');
//   var content = slider.querySelector('.slider__list');
//   var buttonPrevious = slider.querySelector('.slider__arrow--previous');
//   var buttonNext = slider.querySelector('.slider__arrow--next');

//   var index = START_INDEX;

//   buttonPrevious.onclick = function () {
//     sliderNext(true);
//   };

//   buttonNext.onclick = function () {
//     sliderNext();
//   };

//   function sliderNext(prev) {
//     var slides = slider.querySelectorAll('.slider__item');

//     if (prev) {
//       index = (--index) % slides.length;

//       if (index < 0) {
//         index += slides.length;
//       }
//     } else {
//       index = (++index) % slides.length;
//     }

//     // var offset = -index * 100 + PERCENT_SIGN;
//     // content.setAttribute('style', 'transform: translateX(' + offset + ');');

//     var scrollPos = index * (content.scrollWidth / slides.length);
//     content.scrollLeft = scrollPos;
//   }

//   var clientX1 = null;
//   var clientX2 = null;

//   content.addEventListener('touchstart', function (evt) {
//     evt.preventDefault();
//     clientX1 = evt.touches[0].clientX;
//   });

//   content.addEventListener('touchend', function (evt) {
//     evt.preventDefault();
//     clientX2 = evt.changedTouches[0].clientX;

//     if (clientX1 - clientX2 === 0) {
//       return;
//     }

//     if (clientX1 - clientX2 < 0) {
//       sliderNext(true);
//     }

//     if (clientX1 - clientX2 > 0) {
//       sliderNext();
//     }
//   });
// })();
