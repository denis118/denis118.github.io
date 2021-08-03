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

  // export
  window.utility = {
    Maybe: Maybe
  };
})();

//
// tabs
//

(function () {
  var tabs = null;

  var findTabs = function () {
    var Maybe = window.utility.Maybe;
    tabs = new Maybe(document.querySelectorAll('.tabs'));
    tabs = tabs.operand.length
      ? Array.from(tabs.operand)
      : null;
  };

  findTabs();

  if (tabs.length) {
    var hideContent = function (element) {
      element
          .querySelectorAll('.tabs__content')
          .forEach(function (item) {
            if (item.classList.contains('active')) {
              return;
            }

            item.classList.add('hidden-entity');
          });
    };

    var onControlsClick = function (evt) {
      if (!(evt.target.matches('.tabs__anchor-link')
          || evt.target.parentElement.matches('.tabs__anchor-link'))) {
        return;
      }

      evt.preventDefault();

      var anchor = null;

      if (evt.target.matches('.tabs__anchor-link')) {
        anchor = evt.target;
      }

      if (evt.target.parentElement.matches('.tabs__anchor-link')) {
        anchor = evt.target.parentElement;
      }

      var visibleContent = anchor
          .closest('.tabs')
          .querySelector('.tabs__content.active');

      var targetContent = anchor
          .closest('.tabs')
          .querySelector(anchor.getAttribute('href'));

      if (Object.is(visibleContent, targetContent)) {
        return;
      }

      // visibleContent.classList.remove('active');
      // targetContent.classList.add('active');

      visibleContent.setAttribute('class', 'tabs__content hidden-entity');
      targetContent.setAttribute('class', 'tabs__content active');
    };

    var setEventListeners = function (element) {
      element
          .querySelector('.tabs__controls')
          .addEventListener('click', onControlsClick);
    };

    var eraseEventListeners = function (element) {
      element
          .querySelector('.tabs__controls')
          .removeEventListener('click', onControlsClick);
    };

    var onDocumentDOMContentLoaded = function () {
      tabs.forEach(function (it) {
        hideContent(it);
        setEventListeners(it);
      });
    };

    var onWindowBeforeunload = function () {
      tabs.forEach(function (it) {
        eraseEventListeners(it);
      });
    };

    document.addEventListener('DOMContentLoaded', onDocumentDOMContentLoaded);
    window.addEventListener('beforeunload', onWindowBeforeunload);
  }
})();
