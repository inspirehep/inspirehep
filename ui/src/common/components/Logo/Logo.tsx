import { Link } from 'react-router-dom';

import './Logo.less';
import { HOME } from '../../routes';
import LogoSvg from './logo.svg?react';

const Logo = () => (
  <Link className="__Logo__" to={HOME}>
    <LogoSvg className="logo" />
  </Link>
);

export default Logo;
