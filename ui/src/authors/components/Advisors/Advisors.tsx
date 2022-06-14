import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import AdvisorsOfDegree from './AdvisorsOfDegree';

function Advisors({
  advisors
}: any) {
  // `Array.from` because Immutable.Map.values returns `Iterable`
  return Array.from(
    advisors
      .groupBy((advisor: any) => advisor.get('degree_type', 'other'))
      .map((advisorsOfDegree: any, degreeType: any) => (
        <AdvisorsOfDegree degreeType={degreeType} advisors={advisorsOfDegree} />
      ))
      .values()
  );
}

Advisors.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  advisors: PropTypes.instanceOf(List).isRequired,
};

export default Advisors;
