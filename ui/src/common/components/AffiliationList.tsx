import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList, { SEPARATOR_AND, SEPARATOR_TYPES } from './InlineList';
import Affiliation from './Affiliation';
import { getInstitutionName } from '../utils';

class AffiliationList extends Component {
  static renderAffiliation(affiliation: any) {
    return <Affiliation affiliation={affiliation} />;
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'affiliations' does not exist on type 'Re... Remove this comment to see the full error message
    const { affiliations, separator } = this.props;
    return (
      <InlineList
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        wrapperClassName="di"
        separator={separator}
        items={affiliations}
        renderItem={AffiliationList.renderAffiliation}
        extractKey={getInstitutionName}
      />
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
AffiliationList.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  affiliations: PropTypes.instanceOf(List),
  separator: PropTypes.oneOf(SEPARATOR_TYPES),
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
AffiliationList.defaultProps = {
  separator: SEPARATOR_AND,
};

export default AffiliationList;
