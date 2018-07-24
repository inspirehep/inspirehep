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

    const href = `//inspirehep.net/search?ln=en&cc=Institutions&p=110__u:"${name}"`;
    return (
      <a target="_blank" href={href}>
        {name}
      </a>
    );
  }
}

InstitutionLink.propTypes = {
  institution: PropTypes.instanceOf(Map).isRequired,
};

export default InstitutionLink;
