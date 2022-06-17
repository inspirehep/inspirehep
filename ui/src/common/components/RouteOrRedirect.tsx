import React from 'react';
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
  // @ts-ignore
  ...Route.propTypes,
};

export default RouteOrRedirect;
