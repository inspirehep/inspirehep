import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import InlineList from '../../../common/components/InlineList/InlineList';
import pluralizeUnlessSingle from '../../../common/utils';
import { DEGREE_TYPE_TO_DISPLAY } from '../../../common/constants';
import Advisor from './Advisor';

function getName(advisor) {
  return advisor.get('name');
}

function renderAdvisor(advisor) {
  return <Advisor advisor={advisor} />;
}

function AdvisorsOfDegree({ advisors, degreeType }) {
  const degreeTypeDisplay =
    degreeType === 'other' ? '' : `${DEGREE_TYPE_TO_DISPLAY[degreeType]} `;
  const label = pluralizeUnlessSingle(
    `${degreeTypeDisplay}Advisor`,
    advisors.size
  );
  return (
    <InlineList
      label={label}
      items={advisors}
      extractKey={getName}
      renderItem={renderAdvisor}
    />
  );
}

AdvisorsOfDegree.propTypes = {
  advisors: PropTypes.instanceOf(List).isRequired,
  degreeType: PropTypes.string.isRequired,
};

export default AdvisorsOfDegree;
