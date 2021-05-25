'use strict';

const onBookingButtonClick = (evt) => {
  evt.preventDefault();
  document.querySelector('#booking')
    .scrollIntoView({ block: 'start', behavior: 'smooth' });
};

const scrollDown = () => {
  if (document.documentElement.clientWidth < 1024) {
    document.querySelector('#main-booking-link')
      .addEventListener('click', onBookingButtonClick);
  }
};

// Window

const watchWindow = () => {
  window.addEventListener('resize', () => {
    if (document.documentElement.clientWidth < 1024) {
      scrollDown();
    }

    if (
      document.documentElement.clientWidth === 1024
      || document.documentElement.clientWidth > 1024
    ) {
      document.querySelector('#main-booking-link')
        .removeEventListener('click', onBookingButtonClick);
    }
  });
};

export {
  scrollDown,
  watchWindow
};
