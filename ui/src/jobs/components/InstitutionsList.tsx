import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList from '../../common/components/InlineList';

class InstitutionsList extends Component {
  static renderInstitution(institution: any) {
    return institution.get('value');
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'institutions' does not exist on type 'Re... Remove this comment to see the full error message
    const { institutions } = this.props;
    return (
      <InlineList
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        items={institutions}
        renderItem={InstitutionsList.renderInstitution}
      />
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
InstitutionsList.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  institutions: PropTypes.instanceOf(List),
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
InstitutionsList.defaultProps = {
  institutions: null,
};

export default InstitutionsList;
