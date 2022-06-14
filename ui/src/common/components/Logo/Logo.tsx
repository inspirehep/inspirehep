import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { HOME } from '../../routes';

import './Logo.scss';
import { ReactComponent as LogoSvg } from './logo.svg';

class Logo extends Component {
  render() {
    return (
      <Link className="__Logo__" to={HOME}>
        <LogoSvg className="logo" />
      </Link>
    );
  }
}

export default Logo;
