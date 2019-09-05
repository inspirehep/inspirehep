import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { getAuthorDisplayName } from '../utils';

class AuthorName extends Component {
  render() {
    const { name } = this.props;
    const displayName = getAuthorDisplayName(name);

    return <span>{displayName}</span>;
  }
}

AuthorName.propTypes = {
  name: PropTypes.instanceOf(Map).isRequired,
};

export default AuthorName;
