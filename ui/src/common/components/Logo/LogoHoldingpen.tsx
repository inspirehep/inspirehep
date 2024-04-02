import React from 'react';
import { Link } from 'react-router-dom';

import './Logo.less';
import { HOLDINGPEN } from '../../routes';
import { ReactComponent as LogoSvg } from './logo-holdingpen.svg';

const LogoHoldingpen = () => (
  <Link className="__Logo__" to={HOLDINGPEN}>
    <LogoSvg className="logo" />
  </Link>
);

export default LogoHoldingpen;
