'use strict';

const isEscEvent = (evt) => {
  return evt.key === ('Escape' || 'Esc');
}

const debounce = (func, ms) => {
  let timerId = null;
  return function () {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      func.apply(this, arguments);
    }, ms);
  }
}

export {
  isEscEvent,
  debounce
};
