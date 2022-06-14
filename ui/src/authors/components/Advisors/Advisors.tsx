import React from 'react';
import { List } from 'immutable';

import AdvisorsOfDegree from './AdvisorsOfDegree';

type Props = {
    advisors: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

function Advisors({ advisors }: Props) {
  // `Array.from` because Immutable.Map.values returns `Iterable`
  return Array.from(
    advisors
      .groupBy((advisor: $TSFixMe) => advisor.get('degree_type', 'other'))
      .map((advisorsOfDegree: $TSFixMe, degreeType: $TSFixMe) => (
        <AdvisorsOfDegree degreeType={degreeType} advisors={advisorsOfDegree} />
      ))
      .values()
  );
}

export default Advisors;
