import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { HOME } from '../routes';
import styleVariables from '../../styleVariables';

export default class Logo extends Component {
  render() {
    return (
      <Link to={HOME}>
        <span style={{ fontSize: '1.65em', color: 'white' }}>INSPIRE</span>
        <span style={{ fontSize: '1.35em', color: styleVariables['primary-color'], marginLeft: '0.2em' }}>beta</span>
      </Link>
    )
  }
}
