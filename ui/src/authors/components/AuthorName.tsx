import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { getAuthorDisplayName } from '../utils';

class AuthorName extends Component {
  render() {
    const { name } = this.props;
    const nativeName = name.getIn(['native_names', 0]);
    const displayName = getAuthorDisplayName(name);

    return (
      <span>
        {displayName}
        {nativeName && <span> ({nativeName})</span>}
      </span>
    );
  }
}

AuthorName.propTypes = {
  name: PropTypes.instanceOf(Map).isRequired,
};

export default AuthorName;
