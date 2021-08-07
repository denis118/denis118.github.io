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

// elements' existence checking
(function () {
  function checkElementsExistence() {
    var elements = Array.from(arguments);
    return elements.every(function (element) {
      return Boolean(element);
    });
  }

  window.elementsExistenceChecking = {
    checkElementsExistence: checkElementsExistence
  };
})();

// listeners managing
(function () {
  function manageListeners(elements, settings) {
    var isElementsArray = Array.isArray(elements);
    var isSettingsObject = window.typeChecking.checkType(settings) === 'object';

    if (!isElementsArray || !isSettingsObject) {
      return;
    }

    var handlersArray = Object.entries(settings);

    function callback(entries) {
      handlersArray.forEach(function (handlers) {
        var eventName = typeof handlers[0] === 'string'
          ? handlers[0]
          : String(handlers[0]);

        var eventFunction = typeof handlers[1] === 'function'
          ? handlers[1]
          : null;

        if (!eventName || eventFunction === null) {
          return;
        }
      });

      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          handlersArray.forEach(function (handlers) {
            entry.target.removeEventListener(handlers[0], handlers[1]);
          });
          return;
        }

        handlersArray.forEach(function (handlers) {
          entry.target.addEventListener(handlers[0], handlers[1]);
        });
      });
    }

    var observer = new IntersectionObserver(callback);
    elements.forEach(function (it) {
      observer.observe(it);
    });
  }

  window.listenersManaging = {
    manageListeners: manageListeners
  };
})();


// navigation
(function () {
  var page = document.querySelector('.page');
  var navigation = document.querySelector('.navigation');
  var navList = document.querySelector('.navigation__list');

  navigation.classList.add('navigation--js');
  navList.classList.add('hidden-before-desktop');

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

  toggle.addEventListener('click', function () {
    page.classList.toggle('navigation-open');
    navList.classList.toggle('hidden-before-desktop');
    burgerDescription.classList.toggle('hidden-entity');
    crossDescription.classList.toggle('hidden-entity');
  });
})();
