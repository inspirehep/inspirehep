import React from 'react';
import { List, Map } from 'immutable';

import AdvisorsOfDegree from './AdvisorsOfDegree';
import { DEGREE_TYPE_TO_DISPLAY } from '../../../common/constants';

function Advisors({ advisors }: { advisors: List<Map<string, string>> }) {
  // `Array.from` because Immutable.Map.values returns `Iterable`
  return (
    <>
      {Array.from(
        advisors
          .groupBy((advisor) => advisor.get('degree_type', 'other'))
          .map((advisorsOfDegree, degreeType) => (
            <AdvisorsOfDegree
              // `degreeType` is a unique identifier for each group, not an array index
              // eslint-disable-next-line react/no-array-index-key
              key={degreeType}
              advisors={advisorsOfDegree as List<Map<string, string>>}
              degreeType={degreeType as keyof typeof DEGREE_TYPE_TO_DISPLAY}
            />
          ))
          .values()
      )}
    </>
  );
}

export default Advisors;
