import React from 'react';
import { Link } from 'react-router-dom';

import './Logo.less';
import { BACKOFFICE } from '../../routes';
import LogoSvg from './logo-backoffice.svg?react';

const LogoBackoffice = () => (
  <Link className="__Logo__" to={BACKOFFICE}>
    <LogoSvg className="logo" />
  </Link>
);

export default LogoBackoffice;
