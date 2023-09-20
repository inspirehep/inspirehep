import React from 'react';
import { List, Map } from 'immutable';

import InlineDataList, { SEPARATOR_AND, SEPARATOR_TYPES } from './InlineList';
import Affiliation from './Affiliation';
import { getInstitutionName } from '../utils';

function AffiliationList({
  affiliations,
  separator,
  unlinked
}: {
  affiliations: List<any>;
  separator: string;
  unlinked?: boolean;
}) {
  function renderAffiliation(affiliation: Map<string, any>, unlinked: boolean) {
    return <Affiliation affiliation={affiliation} unlinked={unlinked}/>;
  }

  return (
    <InlineDataList
      wrapperClassName="di"
      separator={separator}
      items={affiliations}
      renderItem={renderAffiliation}
      extractKey={getInstitutionName}
    />
  );
}
AffiliationList.defaultProps = {
  separator: SEPARATOR_AND,
};

export default AffiliationList;
