'use strict';

// User delition

const deleteUser = () => {
  const table = document.querySelector('.client-requests');
  if (table) {
    table.addEventListener('click', (evt) => {
      if (evt.target.matches('button[data-btn="delete"]')) {
        const client = evt.target.parentNode.parentNode;
        const clientId = evt.target.dataset.id;

        fetch(
          '/user/' + clientId,
          {
            method: 'DELETE'
          }
        )
          .then((data) => {
            client.remove();
          })
          .catch((error) => {
            throw error;
          });
      }
    });
  }
};

deleteUser();
