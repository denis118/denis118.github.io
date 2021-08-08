'use strict';

//
// utility
//

(function () {
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

  // ESC event
  var isEscEvent = function (evt) {
    return evt.key === ('Escape' || 'Esc');
  };

  // export
  window.utility = {
    Maybe: Maybe,
    isEscEvent: isEscEvent
  };
})();

//
// navigation
//

(function () {
  var navigation = null;

  var findNavigation = function () {
    var Maybe = window.utility.Maybe;
    navigation = new Maybe(document.querySelector('.navigation'));
    navigation = navigation.operand
      ? navigation.operand
      : null;
  };

  findNavigation();

  if (navigation) {
    var page = document.querySelector('.page') || document.documentElement;
    page.setAttribute('class', 'page');

    var navList = document.querySelector('.navigation__list');
    navList.classList.add('hidden-before-desktop');
    navigation.classList.add('navigation--js');

    var fragment = document.createDocumentFragment();
    var button = document
        .querySelector('#toggle-with-span')
        .content
        .cloneNode(true);

    fragment.appendChild(button);
    navigation.prepend(fragment);

    var toggle = document.querySelector('.toggle');
    var burgerDescription = toggle.querySelector('.toggle__description--burger');
    var crossDescription = toggle.querySelector('.toggle__description--cross');

    var focusableElements = document.querySelectorAll('a[href]:not([disabled]), button, button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), input[type="tel"]:not([disabled]), select:not([disabled])');

    var manageFocuse = (function () {
      var flage = false;

      return function (elements) {
        if (!flage) {
          elements.forEach(function (it) {
            if (!it.closest('.navigation')) {
              it.setAttribute('tabindex', '-1');
            }
          });

          flage = true;
          return;
        }

        elements.forEach(function (it) {
          if (!it.closest('.navigation')) {
            it.removeAttribute('tabindex');
          }
        });

        flage = false;
      };
    })();

    var onToggleClick = (function () {
      var marker = false;

      return function () {
        page.classList.toggle('scroll-stop');
        page.classList.toggle('navigation-open');
        navList.classList.toggle('hidden-before-desktop');
        burgerDescription.classList.toggle('hidden-entity');
        crossDescription.classList.toggle('hidden-entity');

        manageFocuse(focusableElements);

        if (!marker) {
          document.addEventListener('keydown', onDocumentKeydown);
          document.addEventListener('click', onOverlayClick);
          marker = true;
        } else {
          document.removeEventListener('keydown', onDocumentKeydown);
          document.removeEventListener('click', onOverlayClick);
          marker = false;
        }
      };
    })();

    var onDocumentKeydown = function (evt) {
      if (window.utility.isEscEvent(evt)) {
        onToggleClick();
      }
    };

    var onOverlayClick = function (evt) {
      if (Object.is(evt.target, page)) {
        onToggleClick();
      }
    };

    // var onToggleClick = function () {
    //   page.classList.toggle('scroll-stop');
    //   page.classList.toggle('navigation-open');
    //   navList.classList.toggle('hidden-before-desktop');
    //   burgerDescription.classList.toggle('hidden-entity');
    //   crossDescription.classList.toggle('hidden-entity');

    //   manageFocuse(focusableElements);
    // };

    toggle.addEventListener('click', onToggleClick);

    // document.addEventListener('keydown', onDocumentKeydown);
    // document.addEventListener('click', onOverlayClick);
  }
})();
