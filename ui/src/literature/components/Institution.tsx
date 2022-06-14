import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

class InstitutionLink extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'institution' does not exist on type 'Rea... Remove this comment to see the full error message
    const { institution } = this.props;
    const name = institution.get('name');

    if (name == null) {
      return null;
    }

    return <span>{name}</span>;
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
InstitutionLink.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  institution: PropTypes.instanceOf(Map).isRequired,
};

export default InstitutionLink;
