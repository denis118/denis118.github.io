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

  var sliders;
  var listenersKeeping = {};

  document.addEventListener('DOMContentLoaded', function () {
    findSliders();

    if (sliders) {
      setEventListeners();
    }
  });

  function findSliders() {
    var Maybe = window.monad.Maybe;
    sliders = new Maybe(document.querySelectorAll('.slider'));
    sliders = sliders.operand.length
      ? Array.from(sliders.operand)
      : null;
  }

  function setEventListeners() {
    sliders.forEach(function (it) {
      var onSliderClick = (function () {
        var index = START_INDEX;

        return function (evt) {
          if (!evt.target.matches('.slider__arrow')) {
            return;
          }

          var slider = evt.target.closest('.slider')
            ? evt.target.closest('.slider')
            : null;

          if (!slider) {
            return;
          }

          var slides = Array.from(slider.querySelectorAll('.slider__item'));
          slides[index].setAttribute('class', 'slider__item');

          if (evt.target.matches('.slider__arrow--previous')) {
            index = (--index) % slides.length;

            if (index < 0) {
              index += slides.length;
            }
          }

          if (evt.target.matches('.slider__arrow--next')) {
            index = (++index) % slides.length;
          }

          slides[index].setAttribute('class', 'slider__item active');
        };
      })();

      it.addEventListener('click', onSliderClick);

      listenersKeeping[it.id] = onSliderClick;
    });
  }

  function eraseEventListeners() {
    sliders.forEach(function (it) {
      var onSliderClick = listenersKeeping[it.id];
      it.removeEventListener('click', onSliderClick);
    });
  }

  window.addEventListener('beforeunload', eraseEventListeners);
})();


//
// primitive slider with transform and transition
//

// (function () {
//   var START_INDEX = 0;
//   var PERCENT_SIGN = '%';

//   var slider = document.querySelector('.slider');
//   var content = slider.querySelector('.slider__content');
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

//     var offset = -index * 100 + PERCENT_SIGN;
//     content.setAttribute('style', 'transform: translateX(' + offset + ');');
//   }
// })();
