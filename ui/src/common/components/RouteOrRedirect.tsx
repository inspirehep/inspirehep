import React from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

function RouteOrRedirect({
  component: Component,
  condition,
  redirectTo,
  ...rest
}: any) {
  return (
    <Route
      {...rest}
      render={(props: any) => condition ? <Component {...props} /> : <Redirect to={redirectTo} />
      }
    />
  );
}

RouteOrRedirect.propTypes = {
  redirectTo: PropTypes.string.isRequired,
  condition: PropTypes.bool.isRequired,
  ...Route.propTypes,
};

export default RouteOrRedirect;
