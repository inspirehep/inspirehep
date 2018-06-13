import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

function RouteOrRedirect({
  component: Component,
  condition,
  redirectTo,
  ...rest
}) {
  return (
    <Route
      {...rest}
      render={props =>
        condition ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{ pathname: redirectTo, state: { from: props.location } }}
          />
        )
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
