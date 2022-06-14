import React from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Route, Redirect } from 'react-router-dom';

/*
(ts-migrate) TODO: Migrate the remaining prop types
...Route.propTypes
*/
type Props = {
    redirectTo: string;
    condition: boolean;
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'component' does not exist on type 'Props... Remove this comment to see the full error message
function RouteOrRedirect({ component: Component, condition, redirectTo, ...rest }: Props) {
  return (
    <Route
      {...rest}
      render={(props: $TSFixMe) => condition ? <Component {...props} /> : <Redirect to={redirectTo} />
      }
    />
  );
}

export default RouteOrRedirect;
