'use strict';

import {
  isEscEvent
} from './utils.min.js';

const cloneErrorNode = () => {
  const errorBlock = document.querySelector('#error')
    .content
    .querySelector('.error');
  const newError = errorBlock.cloneNode(true);
  const errorTitle = newError.querySelector('.error__title');
  const errorButton = newError.querySelector('.error__button');
  return { newError, errorTitle, errorButton };
}

const cloneSuccessNode = () => {
  const successBlock = document.querySelector('#success')
    .content
    .querySelector('.success');
  const newSuccess = successBlock.cloneNode(true);
  const successTitle = newSuccess.querySelector('.success__title');
  const successButton = newSuccess.querySelector('.success__button');
  return { newSuccess, successTitle, successButton };
}

const showMessage = () => {
  return function (error, params = {}) {
    const page = document.querySelector('.page');
    const fragment = document.createDocumentFragment();
    let newNode = null;
    let newNodeButton = null;

    if (error) {
      const { newError, errorTitle, errorButton } = cloneErrorNode();
      if (params.title) {
        errorTitle.innerText = params.title;
      }
      if (params.button) {
        errorButton.innerText = params.button;
      }
      newNode = newError;
      newNodeButton = errorButton;
    } else {
      const { newSuccess, successTitle, successButton } = cloneSuccessNode();
      if (params.title) {
        successTitle.innerText = params.title;
      }
      if (params.button) {
        successButton.innerText = params.button;
      }
      newNode = newSuccess;
      newNodeButton = successButton;
    }

    fragment.appendChild(newNode);
    page.appendChild(fragment);

    const onMessageButtonClick = () => {
      page.removeChild(newNode);
      page.classList.remove('modal-open');
      document.removeEventListener('click', onDocumentClick);
      document.removeEventListener('keydown', onDocumentEscKeydown);
    };

    const onDocumentClick = (evt) => {
      if (
        evt.target.className.match(/^error$/)
        || evt.target.className.match(/^success$/)
      ) {
        onMessageButtonClick();
      }
    };

    const onDocumentEscKeydown = (evt) => {
      if (isEscEvent(evt)) { onMessageButtonClick() }
    };

    newNodeButton.addEventListener('click', onMessageButtonClick, {once: true});
    document.addEventListener('click', onDocumentClick);
    document.addEventListener('keydown', onDocumentEscKeydown);
  }
}


export {
  showMessage
};
