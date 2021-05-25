'use strict';

import {
  showMessage
} from './message.min.js';

const page = document.querySelector('.page');
const onSuccess = showMessage();
const onError = showMessage();

const bookTheUser = () => {
  const form = document.querySelector('#booking__form');

  if (form) {
    form.addEventListener('submit', (evt) => {
      evt.preventDefault();

      const data = {};
      Array.from(form.querySelectorAll('input'))
        .forEach(item => data[item.name] = item.value);

      fetch(
        '/user',
        {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json;charset=utf-8'
          }
        },
      )
        .then(response => {
          if (!response.ok) { throw new Error() }
          onSuccess();
          page.classList.add('modal-open');
        })
        .catch(error => {
          onError(error);
          page.classList.add('modal-open');
        });
  });
}
};

const highlightForm = () => {
  const bookingBtn = document.querySelector('#main-booking-link');
  const bookingForm = document.querySelector('#booking__form');

  if (bookingBtn && bookingForm) {
    bookingBtn.addEventListener('click', (evt) => {
      evt.preventDefault();
      bookingForm.classList.add('booking__form--illuminated');

      setTimeout(() => {
        bookingForm.classList.remove('booking__form--illuminated');
      }, 1000);
    });
  }
};

export {
  bookTheUser,
  highlightForm
};
