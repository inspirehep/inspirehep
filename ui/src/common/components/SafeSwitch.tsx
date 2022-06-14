import React from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Switch, Redirect } from 'react-router-dom';
import { ERRORS } from '../routes';

function SafeSwitch({
  children,
  ...switchProps
}: any) {
  return (
    <Switch {...switchProps}>
      {children}
      <Redirect to={ERRORS} />
    </Switch>
  );
}

SafeSwitch.propTypes = {
  ...Switch.propTypes,
};

export default SafeSwitch;
