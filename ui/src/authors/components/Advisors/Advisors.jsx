import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import AdvisorsOfDegree from './AdvisorsOfDegree';

function Advisors({ advisors }) {
  // `Array.from` because Immutable.Map.values returns `Iterable`
  return Array.from(
    advisors
      .groupBy(advisor => advisor.get('degree_type', 'other'))
      .map((advisorsOfDegree, degreeType) => (
        <AdvisorsOfDegree degreeType={degreeType} advisors={advisorsOfDegree} />
      ))
      .values()
  );
}

Advisors.propTypes = {
  advisors: PropTypes.instanceOf(List).isRequired,
};

export default Advisors;
