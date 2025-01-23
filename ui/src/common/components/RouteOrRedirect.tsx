import React, { ComponentPropsWithoutRef } from 'react';
import { Route, Redirect } from 'react-router-dom';

interface RouteOrRedirectProps extends ComponentPropsWithoutRef<any> {
  component: any;
  condition: boolean;
  redirectTo: string;
}

function RouteOrRedirect({
  component: Component,
  condition,
  redirectTo,
  ...rest
}: RouteOrRedirectProps) {
  return (
    <Route
      {...rest}
      render={(props) =>
        condition ? (
          <Component {...props} />
        ) : (
          <Redirect to={redirectTo || '/'} />
        )
      }
    />
  );
}

export default RouteOrRedirect;
