import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import ExternalLink from '../../common/components/ExternalLink';

class InstitutionLink extends Component {
  render() {
    const { institution } = this.props;
    const name = institution.get('name');

    if (name == null) {
      return null;
    }

    const href = `//inspirehep.net/search?ln=en&cc=Institutions&p=110__u:"${name}"`;
    return <ExternalLink href={href}>{name}</ExternalLink>;
  }
}

InstitutionLink.propTypes = {
  institution: PropTypes.instanceOf(Map).isRequired,
};

export default InstitutionLink;
