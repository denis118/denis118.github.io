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

// accordeon

// проверка через монаду, по-моему, лучше, т.к. в случае большего количества искомых
// элементов каждый нужно будет проверять на null и код разрастётся

(function () {
  var Maybe = window.monad.Maybe;
  var accordeon = new Maybe(document.querySelector('.accordeon-1'));
  var contents = accordeon.map(function (element) {
    return Array.from(element.querySelectorAll('.accordeon__content'));
  });

  if (contents.operand.length) {
    accordeon = accordeon.operand;
    contents = contents.operand;

    contents.forEach(function (it) {
      it.classList.add('hidden-entity');
    });

    if ('IntersectionObserver' in window) {
      window.listenersManaging.manageListeners([accordeon], {'click': onAccordeonClick});
    } else {
      accordeon.addEventListener('click', onAccordeonClick);
    }
  }

  function onAccordeonClick(evt) {
    if (evt.target.matches('.accordeon__btn')) {
      contents.forEach(function (it) {
        if (it === evt.target.nextElementSibling) {
          it.classList.toggle('hidden-entity');
        }
      });

      evt.target.classList.toggle('accordeon__btn--active');
    }
  }
})();