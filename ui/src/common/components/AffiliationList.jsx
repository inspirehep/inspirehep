import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineDataList, { SEPARATOR_AND, SEPARATOR_TYPES } from './InlineList';
import Affiliation from './Affiliation';
import { getInstitutionName } from '../utils';

class AffiliationList extends Component {
  static renderAffiliation(affiliation, unlinked) {
    return <Affiliation affiliation={affiliation} unlinked={unlinked} />;
  }

  render() {
    const { affiliations, separator, unlinked } = this.props;
    return (
      <InlineDataList
        wrapperClassName="di"
        separator={separator}
        items={affiliations}
        renderItem={(affiliation) =>
          AffiliationList.renderAffiliation(affiliation, unlinked)
        }
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
