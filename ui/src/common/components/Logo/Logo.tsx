import React from 'react';
import { Link } from 'react-router-dom';

import './Logo.less';
import { HOME } from '../../routes';
import { ReactComponent as LogoSvg } from './logo.svg';

const Logo = () => (
  <Link className="__Logo__" to={HOME}>
    <LogoSvg className="logo" />
  </Link>
);

export default Logo;
