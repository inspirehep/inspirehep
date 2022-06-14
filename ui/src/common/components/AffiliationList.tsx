import React, { Component } from 'react';
import { List } from 'immutable';

import InlineList, { SEPARATOR_AND, SEPARATOR_TYPES } from './InlineList';
import Affiliation from './Affiliation';
import { getInstitutionName } from '../utils';

type OwnProps = {
    affiliations?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
    separator?: $TSFixMe; // TODO: PropTypes.oneOf(SEPARATOR_TYPES)
};

type Props = OwnProps & typeof AffiliationList.defaultProps;

class AffiliationList extends Component<Props> {

static defaultProps = {
    separator: SEPARATOR_AND,
};

  static renderAffiliation(affiliation: $TSFixMe) {
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

export default AffiliationList;
