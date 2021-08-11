'use strict';


// maybe
(function () {
  function Maybe(operand) {
    this.operand = operand;
  }

  Maybe.prototype.map = function (operator) {
    if (this.operand && operator) {
      return new Maybe(operator(this.operand));
    } else {
      return new Maybe(null);
    }
  };

  window.monad = {
    Maybe: Maybe
  };
})();


//
// primitive slider
//

(function () {
  var START_INDEX = 0;

  var sliders = null;
  var listenersKeeping = {};
  var cursorPosition = {};

  var findSliders = function () {
    var Maybe = window.monad.Maybe;
    sliders = new Maybe(document.querySelectorAll('.slider'));
    sliders = sliders.operand.length
      ? Array.from(sliders.operand)
      : null;
  };

  var sliderNext = function (prev, slider, index) {
    var slides = slider.querySelectorAll('.slider__item');
    slides[index].setAttribute('class', 'slider__item');

    if (prev) {
      index = (--index) % slides.length;

      if (index < 0) {
        index += slides.length;
      }
    } else {
      index = (++index) % slides.length;
    }

    slides[index].setAttribute('class', 'slider__item active');

    return index;
  };

  var findClosestSlider = function (evt) {
    return evt.target.closest('.slider')
      ? evt.target.closest('.slider')
      : null;
  };

  var setEventListeners = function () {
    sliders.forEach(function (it) {
      var buildHandlerSet = (function () {
        var index = START_INDEX;

        return [
          // onSliderClick
          function (evt) {
            if (!evt.target.matches('.slider__arrow')) {
              return;
            }

            var slider = findClosestSlider(evt);
            if (!slider) {
              return;
            }

            if (evt.target.matches('.slider__arrow--previous')) {
              index = sliderNext(true, slider, index);
            }

            if (evt.target.matches('.slider__arrow--next')) {
              index = sliderNext(null, slider, index);
            }
          },
          // onSliderTouchstart
          function (evt) {
            evt.preventDefault();
            cursorPosition[it.id].clientX1 = evt.touches[0].clientX;
          },
          // onSliderTouchend
          function (evt) {
            evt.preventDefault();

            var slider = findClosestSlider(evt);
            if (!slider) {
              return;
            }

            cursorPosition[it.id].clientX2 = evt.changedTouches[0].clientX;

            var clientX1 = cursorPosition[it.id].clientX1;
            var clientX2 = cursorPosition[it.id].clientX2;

            if (clientX1 - clientX2 === 0) {
              return;
            }

            if (clientX1 - clientX2 < 0) {
              index = sliderNext(true, slider, index);
            }

            if (clientX1 - clientX2 > 0) {
              index = sliderNext(null, slider, index);
            }
          }
        ];
      })();

      var onSliderClick = buildHandlerSet[0];
      var onSliderTouchstart = buildHandlerSet[1];
      var onSliderTouchend = buildHandlerSet[2];

      var content = it.querySelector('.slider__list');
      content.addEventListener('touchstart', onSliderTouchstart);
      content.addEventListener('touchend', onSliderTouchend);
      it.addEventListener('click', onSliderClick);

      cursorPosition[it.id] = {};
      listenersKeeping[it.id] = {};
      listenersKeeping[it.id].onSliderClick = onSliderClick;
      listenersKeeping[it.id].onSliderTouchstart = onSliderTouchstart;
      listenersKeeping[it.id].onSliderTouchend = onSliderTouchend;
    });
  };

  var onWindowBeforeunload = function () {
    sliders.forEach(function (it) {
      it.removeEventListener('click', listenersKeeping[it.id].onSliderClick);
      it.removeEventListener('touchstart', listenersKeeping[it.id].onSliderTouchstart);
      it.removeEventListener('touchend', listenersKeeping[it.id].onSliderTouchend);
    });

    document.removeEventListener('DOMContentLoaded', onDocumentDOMContentLoaded);
    window.removeEventListener('beforeunload', onWindowBeforeunload);
  };

  var onDocumentDOMContentLoaded = function () {
    findSliders();

    if (sliders) {
      setEventListeners();
    }
  };

  document.addEventListener('DOMContentLoaded', onDocumentDOMContentLoaded);
  window.addEventListener('beforeunload', onWindowBeforeunload);
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
