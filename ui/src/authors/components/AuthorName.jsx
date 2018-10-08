import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

class AuthorName extends Component {
  getFormattedNameValue() {
    const { name } = this.props;
    const nameValue = name.get('value');
    const splittedByComma = nameValue.split(', ');
    return splittedByComma.length === 2
      ? `${splittedByComma[1]} ${splittedByComma[0]}`
      : nameValue;
  }

  render() {
    const { name } = this.props;
    const displayName =
      name.get('preferred_name') || this.getFormattedNameValue();

    return <span>{displayName}</span>;
  }
}

AuthorName.propTypes = {
  name: PropTypes.instanceOf(Map).isRequired,
};

export default AuthorName;
