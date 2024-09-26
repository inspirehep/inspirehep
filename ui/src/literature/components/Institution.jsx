import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

class InstitutionLink extends Component {
  render() {
    const { institution } = this.props;
    const name = institution.get('name');

    if (name == null) {
      return null;
    }

    return <span>{name}</span>;
  }
}

InstitutionLink.propTypes = {
  institution: PropTypes.instanceOf(Map).isRequired,
};

export default InstitutionLink;
