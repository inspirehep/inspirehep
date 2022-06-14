import React, { Component } from 'react';
import { Map } from 'immutable';

type Props = {
    institution: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
};

class InstitutionLink extends Component<Props> {

  render() {
    const { institution } = this.props;
    const name = institution.get('name');

    if (name == null) {
      return null;
    }

    return <span>{name}</span>;
  }
}

export default InstitutionLink;
