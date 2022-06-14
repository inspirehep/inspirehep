import React from 'react';
import { Switch, Redirect } from 'react-router-dom';
import { ERRORS } from '../routes';

function SafeSwitch({ children, ...switchProps }) {
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
