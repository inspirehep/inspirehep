import React from 'react';
import { Link } from 'react-router-dom';

import './Logo.less';
import { HOLDINGPEN_NEW } from '../../routes';
import { ReactComponent as LogoSvg } from './logo-holdingpen.svg';

const LogoHoldingpen = () => (
  <Link className="__Logo__" to={HOLDINGPEN_NEW}>
    <LogoSvg className="logo" />
  </Link>
);

export default LogoHoldingpen;
