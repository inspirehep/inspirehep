import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList, { SEPARATOR_AND, SEPARATOR_TYPES } from './InlineList';
import Affiliation from './Affiliation';
import { getInstitutionName } from '../utils';

class AffiliationList extends Component {
  static renderAffiliation(affiliation) {
    return <Affiliation affiliation={affiliation} />;
  }

  render() {
    const { affiliations, separator } = this.props;
    return (
      <InlineList
        wrapperClassName="di"
        separator={separator}
        items={affiliations}
        renderItem={AffiliationList.renderAffiliation}
        extractKey={getInstitutionName}
      />
    );
  }
}

AffiliationList.propTypes = {
  affiliations: PropTypes.instanceOf(List),
  separator: PropTypes.oneOf(SEPARATOR_TYPES),
};

AffiliationList.defaultProps = {
  separator: SEPARATOR_AND,
};

export default AffiliationList;
