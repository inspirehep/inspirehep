import { ERRORS } from '../common/routes';

export default function() {
  return next => action => {
    const { meta } = action;
    if (meta && meta.redirectableError) {
      const { error } = action.payload;

      // INFO: 'push' and 'replace' methods from 'connected-react-router' 
      // remove error causing url from history. To be able to keep in 
      // and retrieve it from history in error pages we use window API
      if (error.status === 400) {
        window.location.assign(`${ERRORS}/500`);
      }
      window.location.assign(`${ERRORS}/${error.status}`);
    }
    return next(action);
  };
}
