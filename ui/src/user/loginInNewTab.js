function addEventListenerForMessage(callback) {
  window.addEventListener('message', callback, false);
}

function loginInNewTab(externalLoginUrl) {
  const loginTab = window.open(externalLoginUrl, '_blank');
  // TODO: use localStorage instead of message passing
  return new Promise((resolve, reject) => {
    addEventListenerForMessage(message => {
      if (
        !message.origin.includes(
          `${window.location.protocol}//${window.location.host}`
        )
      ) {
        loginTab.close();
        reject(new Error('Not allowed'));
      }

      if (message.data.payload) {
        try {
          resolve(JSON.parse(message.data.payload));
        } catch (_) {
          resolve(message.data.payload);
        } finally {
          loginTab.close();
        }
      } else {
        loginTab.close();
        reject(new Error('Unauthorized'));
      }
    });
  });
}

const ORCID_OAUTH_URL = '/oauth/login/orcid?next=/login_success';
export default function() {
  return loginInNewTab(ORCID_OAUTH_URL);
}
