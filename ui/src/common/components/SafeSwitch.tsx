import React from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Switch, Redirect } from 'react-router-dom';
import { ERRORS } from '../routes';

/*
(ts-migrate) TODO: Migrate the remaining prop types
...Switch.propTypes
*/
type Props = {};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'children' does not exist on type 'Props'... Remove this comment to see the full error message
function SafeSwitch({ children, ...switchProps }: Props) {
  return (
    <Switch {...switchProps}>
      {children}
      <Redirect to={ERRORS} />
    </Switch>
  );
}

export default SafeSwitch;
