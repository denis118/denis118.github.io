'use strict';

//
// utility
//

(function () {
  var DESKTOP_WIDTH = 1024;

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

  // TAB event
  var isTabEvent = function (evt) {
    return evt.key === 'Tab';
  };

  // focusable elements' selectors
  var focusableSelectors = [
    'a[href]:not([tabindex^="-"])',
    'area[href]:not([tabindex^="-"])',
    'input:not([type="hidden"]):not([type="radio"]):not([disabled]):not([tabindex^="-"])',
    'input[type="radio"]:not([disabled]):not([tabindex^="-"]):checked',
    'select:not([disabled]):not([tabindex^="-"])',
    'textarea:not([disabled]):not([tabindex^="-"])',
    'button:not([disabled]):not([tabindex^="-"])',
    'iframe:not([tabindex^="-"])',
    'audio[controls]:not([tabindex^="-"])',
    'video[controls]:not([tabindex^="-"])',
    '[contenteditable]:not([tabindex^="-"])',
    '[tabindex]:not([tabindex^="-"])',
  ];

  // isPreDesktopWidth
  var isPreDesktopWidth = function () {
    return document.documentElement.clientWidth < DESKTOP_WIDTH;
  };

  // export
  window.utility = {
    Maybe: Maybe,
    isEscEvent: isEscEvent,
    isTabEvent: isTabEvent,
    isPreDesktopWidth: isPreDesktopWidth,
    focusableSelectors: focusableSelectors
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
    var manageNavigation = function () {
      var that = {};

      that.activate = function () {
        this.navigation = navigation;
        this.navList = this.navigation.querySelector('.navigation__list');
        this.page = document.querySelector('.page') || document.documentElement;

        this.navigation.classList.add('navigation--js');
        this.page.setAttribute('class', 'page');
        this.attributeSet = {
          'role': 'dialog',
          'aria-modal': true
        };

        this.isShown = false;

        return this;
      };

      that.setAttributes = function () {
        if (isPreDesktopWidth()) {
          for (var attribute in this.attributeSet) {
            if (this.attributeSet.hasOwnProperty(attribute)) {
              this.navigation.setAttribute(attribute, this.attributeSet[attribute]);
            }
          }

          if (!this.navList.classList.contains('hidden-before-desktop')) {
            this.navList.classList.add('hidden-before-desktop');
          }
        }

        return this;
      };

      that.resetAttributes = function () {
        if (!isPreDesktopWidth()) {
          for (var attribute in this.attributeSet) {
            if (this.attributeSet.hasOwnProperty(attribute)) {
              this.navigation.removeAttribute(attribute);
            }
          }

          this.navList.classList.remove('hidden-before-desktop');
        }
      };

      that.insertToggle = function () {
        var fragment = document.createDocumentFragment();
        var button = document
            .querySelector('#toggle-with-span')
            .content
            .cloneNode(true);

        fragment.appendChild(button);
        this.navigation.prepend(fragment);

        this.toggle = document.querySelector('.toggle');
        this.burgerDescription = this.toggle.querySelector('.toggle__description--burger');
        this.crossDescription = this.toggle.querySelector('.toggle__description--cross');

        this.toggle.addEventListener('click', this.onToggleClick);
      };

      that.show = function () {
        this.isShown = true;
        this.previouslyFocused = document.activeElement;

        this.page.classList.add('scroll-stop');
        this.page.classList.add('navigation-open');
        this.burgerDescription.classList.add('hidden-entity');
        this.crossDescription.classList.remove('hidden-entity');
        this.navList.classList.remove('hidden-before-desktop');
        this.moveFocusIn();
        this.setEventListeners();
      };

      that.hide = function () {
        if (this.previouslyFocused && this.previouslyFocused.focus) {
          this.previouslyFocused.focus();
        }

        this.isShown = false;
        this.page.classList.remove('scroll-stop');
        this.page.classList.remove('navigation-open');
        this.burgerDescription.classList.remove('hidden-entity');
        this.crossDescription.classList.add('hidden-entity');
        this.navList.classList.add('hidden-before-desktop');
        this.eraseEventListeners();
      };

      that.moveFocusIn = function () {
        var target = this.navigation.querySelector('[autofocus]')
          || this.getFocusableChildren()[0];

        if (target) {
          target.focus();
        }
      };

      that.trapTabKey = function (node, evt) {
        var focusableChildren = this.getFocusableChildren(node);
        var focusedItemIndex = focusableChildren.indexOf(document.activeElement);
        var lastIndex = focusableChildren.length - 1;
        var withShift = evt.shiftKey;

        if (withShift && focusedItemIndex === 0) {
          focusableChildren[lastIndex].focus();
          evt.preventDefault();
        } else if (!withShift && focusedItemIndex === lastIndex) {
          focusableChildren[0].focus();
          evt.preventDefault();
        }
      };

      that.isVisible = function (node) {
        return node.offsetWidth
          || node.offsetHeight
          || node.getClientRects().length
          ? true
          : false;
      };

      that.getFocusableChildren = function () {
        return Array.from(
            this.navigation
                .querySelectorAll(window.utility.focusableSelectors.join(','))
        ).filter(this.isVisible);
      };

      that.onToggleClick = function () {
        if (!that.isShown) {
          that.show();
        } else {
          that.hide();
        }
      };

      that.onDocumentKeyDown = function (evt) {
        if (isEscEvent(evt)) {
          that.onToggleClick();
        } else if (isTabEvent(evt)) {
          that.trapTabKey(that.navigation, evt);
        }
      };

      that.onDocumentClick = function (evt) {
        if (Object.is(evt.target, that.page)) {
          that.onToggleClick();
        }
      };

      that.onBodyFocus = function (evt) {
        var isInDialog = evt.target.closest('[aria-modal="true"]');

        if (!isInDialog) {
          that.moveFocusIn();
        }
      };

      that.setEventListeners = function () {
        document.addEventListener('click', this.onDocumentClick);
        document.addEventListener('keydown', this.onDocumentKeyDown);
        document.body.addEventListener('focus', this.onBodyFocus, true);
      };

      that.eraseEventListeners = function () {
        document.removeEventListener('click', this.onDocumentClick);
        document.removeEventListener('keydown', this.onDocumentKeyDown);
        document.body.removeEventListener('focus', this.onBodyFocus, true);
      };

      that.destroy = function () {
        this.toggle.removeEventListener('click', this.onToggleClick);
        document.removeEventListener('click', this.onDocumentClick);
        document.removeEventListener('keydown', this.onDocumentKeyDown);
        document.body.removeEventListener('focus', this.onBodyFocus, true);
      };

      return that;
    };

    var isPreDesktopWidth = window.utility.isPreDesktopWidth;
    var isEscEvent = window.utility.isEscEvent;
    var isTabEvent = window.utility.isTabEvent;

    var navigationManager = manageNavigation();
    navigationManager
        .activate()
        .setAttributes()
        .insertToggle();

    var onWindowResize = (function () {
      var isWorkedOnPreDesktopWidth = false;
      var isWorkedOnDesktopWidth = false;

      return function () {
        if (!isPreDesktopWidth() && !isWorkedOnDesktopWidth) {
          navigationManager.resetAttributes();
          navigationManager.hide();
          isWorkedOnPreDesktopWidth = false;
          isWorkedOnDesktopWidth = true;
          return;
        }

        if (isPreDesktopWidth() && !isWorkedOnPreDesktopWidth) {
          navigationManager.setAttributes();
          isWorkedOnPreDesktopWidth = true;
          isWorkedOnDesktopWidth = false;
        }
      };
    })();

    var onWindowBeforeunload = function () {
      navigationManager.destroy();
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('beforeunload', onWindowBeforeunload);
    };

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('beforeunload', onWindowBeforeunload);
  }
})();


//
// focus managing (first edition)
// https://www.smashingmagazine.com/2021/07/accessible-dialog-from-scratch/
//

/*
(function () {
  var manageFocus = function (element) {
    var that = {};

    that.activate = function () {
      var _ = this;

      _.element = element;
      _.events = {
        show: [],
        hide: []
      };

      _.show = _.show.bind(_);
      _.hide = _.hide.bind(_);
      _.onBodyFocus = _.onBodyFocus.bind(_);
      _.onDocumentKeyDown = _.onDocumentKeyDown.bind(_);

      var attributeSet = {
        'hidden': true,
        'role': 'dialog',
        'aria-modal': true
      };

      for (var attribute in attributeSet) {
        if (attributeSet.hasOwnProperty(attribute)) {
          _.element.setAttribute(attribute, attributeSet[attribute]);
        }
      }

      _.element
          .querySelectorAll('[data-dialog-hide]')
          .forEach(function (closer) {
            closer.addEventListener('click', _.hide);
          });

      return _;
    };

    that.show = function () {
      var _ = this;

      _.isShown = true;
      _.previouslyFocused = document.activeElement;
      _.element.removeAttribute('hidden');

      _.moveFocusIn();

      document.addEventListener('keydown', _.onDocumentKeyDown);
      document.body.addEventListener('focus', _.onBodyFocus, true);

      _.events.show.forEach(function (event) {
        event();
      });
    };

    that.hide = function () {
      var _ = this;

      if (_.previouslyFocused && _.previouslyFocused.focus) {
        _.previouslyFocused.focus();
      }

      _.isShown = false;
      _.element.setAttribute('hidden', true);

      document.removeEventListener('keydown', _.onDocumentKeyDown);
      document.body.removeEventListener('focus', _.onBodyFocus, true);

      _.events.hide.forEach(function (event) {
        event();
      });
    };

    that.destroy = function () {
      var _ = this;

      _.element
          .querySelectorAll('[data-dialog-hide]')
          .forEach(function (closer) {
            closer.removeEventListener('click', _.hide);
          });

      _.events.show.forEach(function (event) {
        _.off('show', event);
      });

      _.events.hide.forEach(function (event) {
        _.off('hide', event);
      });
    };

    that.on = function (type, func) {
      this.events[type].push(func);
    };

    that.off = function (type, func) {
      var _ = this;
      var index = _.events[type].indexOf(func);

      if (index > -1) {
        _.events[type].splice(index, 1);
      }
    };

    that.moveFocusIn = function () {
      var _ = this;

      var target = _.element.querySelector('[autofocus]')
        || _.getFocusableChildren()[0];

      if (target) {
        target.focus();
      }
    };

    that.onDocumentKeyDown = function (evt) {
      var _ = this;

      if (evt.key === 'Escape') {
        _.hide();
      } else if (evt.key === 'Tab') {
        _.trapTabKey(_.element, evt);
      }
    };

    that.onBodyFocus = function (evt) {
      var _ = this;

      var isInDialog = evt.target.closest('[aria-modal="true"]');

      if (!isInDialog) {
        _.moveFocusIn();
      }
    };

    that.trapTabKey = function (node, evt) {
      var _ = this;

      var focusableChildren = _.getFocusableChildren(node);
      var focusedItemIndex = focusableChildren.indexOf(document.activeElement);
      var lastIndex = focusableChildren.length - 1;
      var withShift = evt.shiftKey;

      if (withShift && focusedItemIndex === 0) {
        focusableChildren[lastIndex].focus();
        evt.preventDefault();
      } else if (!withShift && focusedItemIndex === lastIndex) {
        focusableChildren[0].focus();
        evt.preventDefault();
      }
    };

    that.isVisible = function (node) {
      return node.offsetWidth
        || node.offsetHeight
        || node.getClientRects().length
        ? true
        : false;
    };

    that.getFocusableChildren = function () {
      var _ = this;

      return Array.from(
          _.element
              .querySelectorAll(window.utility.focusableSelectors.join(','))
      ).filter(_.isVisible);
    };

    return that;
  };

  // export
  window.focusManaging = {
    manageFocus: manageFocus
  };
})();
*/

//
// navigation (fist variant, valid)
//

/*
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

    var focusableElements = document.querySelectorAll(window.utility.focusableSelectors.join(','));

    var manageFocus = (function () {
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

        manageFocus(focusableElements);

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

    toggle.addEventListener('click', onToggleClick);
  }
})();
*/
