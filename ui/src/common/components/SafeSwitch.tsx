import React, { ComponentPropsWithoutRef } from 'react';
import { Switch, Redirect } from 'react-router-dom';

import { ERRORS } from '../routes';

interface SwitchProps extends ComponentPropsWithoutRef<any> {
  children: JSX.Element[] | JSX.Element;
  switchProps?: Switch;
}

function SafeSwitch(props: SwitchProps) {
  return (
    <Switch {...props.switchProps}>
      {props.children}
      <Redirect to={ERRORS} />
    </Switch>
  );
}

export default SafeSwitch;
