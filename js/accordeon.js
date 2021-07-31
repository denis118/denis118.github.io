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

// accordeon
(function () {
  var TABLET_WIDTH = 768;
  var UNITS = 'px';

  var accordeons;

  window.addEventListener('load', function () {
    findAccordeons();

    if (accordeons.length) {
      addButtonsJsStyles();

      if (isPreTabletWidth()) {
        addContentsJsStyles();
        setEventListeners();
      }
    }
  });

  function isPreTabletWidth() {
    return document.documentElement.clientWidth < TABLET_WIDTH;
  }

  function findAccordeons() {
    var Maybe = window.monad.Maybe;
    accordeons = new Maybe(document.querySelectorAll('.accordeon'));
    accordeons = accordeons.operand.length
      ? Array.from(accordeons.operand)
      : null;
  }

  function addButtonsJsStyles() {
    accordeons.forEach(function (it) {
      Array.from(it.querySelectorAll('.accordeon__btn')).forEach(function (item) {
        item.classList.add('accordeon__btn--js');
      });
    });
  }

  function addContentsJsStyles() {
    accordeons.forEach(function (it) {
      Array.from(it.querySelectorAll('.accordeon__content')).forEach(function (item) {
        hideContent(item);
      });
    });
  }

  function removeContentsJsStyles() {
    accordeons.forEach(function (it) {
      Array.from(it.querySelectorAll('.accordeon__content')).forEach(function (item) {
        showContent(item);
      });
    });
  }

  function hideContent(item) {
    item.classList.add('accordeon__content--js');
  }

  function showContent(item) {
    item.classList.remove('accordeon__content--js');
  }

  function setEventListeners() {
    accordeons.forEach(function (it) {
      it.addEventListener('click', onAccordeonClick);
    });
  }

  function eraseEventListeners() {
    accordeons.forEach(function (it) {
      it.removeEventListener('click', onAccordeonClick);
    });
  }

  function onAccordeonClick(evt) {
    if (evt.target.matches('.accordeon__btn')) {
      var isButtonInactive = !evt.target.classList.contains('accordeon__btn--active');
      var accordeon = evt.target.closest('.accordeon');

      Array.from(accordeon.querySelectorAll('.accordeon__btn')).forEach(function (item) {
        item.classList.remove('accordeon__btn--active');
      });

      Array.from(accordeon.querySelectorAll('.accordeon__content')).forEach(function (item) {
        item.style.maxHeight = null;
      });

      if (isButtonInactive) {
        evt.target.classList.toggle('accordeon__btn--active');

        var hasButtonNextElementSibling = evt.target.nextElementSibling
          ? true
          : false;

        var isButtonNextElementSiblingContent = evt.target.nextElementSibling.matches('.accordeon__content')
          ? true
          : false;

        if (hasButtonNextElementSibling && isButtonNextElementSiblingContent) {
          var content = evt.target.nextElementSibling;

          if (content.style.maxHeight) {
            content.style.maxHeight = null;
          } else {
            content.style.maxHeight = content.scrollHeight + UNITS;
          }
        }
      }
    }
  }

  var onWindowResize = (function () {
    var isWorkedOnPreTabletWidth = false;

    return function () {
      if (!isPreTabletWidth()) {
        if (!accordeons) {
          return;
        }

        removeContentsJsStyles();
        eraseEventListeners();
        isWorkedOnPreTabletWidth = false;
        return;
      }

      if (isPreTabletWidth() && !isWorkedOnPreTabletWidth) {
        addContentsJsStyles();
        setEventListeners();
        isWorkedOnPreTabletWidth = true;
      }
    };
  })();

  window.addEventListener('resize', onWindowResize);
})();
