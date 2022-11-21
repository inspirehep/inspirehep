import React from 'react';
import { List, Map } from 'immutable';

import InlineDataList from '../../../common/components/InlineList/InlineDataList';
import { pluralizeUnlessSingle } from '../../../common/utils';
import { DEGREE_TYPE_TO_DISPLAY } from '../../../common/constants';
import Advisor from './Advisor';

function getName(advisor: Map<string, string>) {
  return advisor.get('name');
}

function renderAdvisor(advisor: Map<string, string>) {
  return <Advisor advisor={advisor} />;
}

function AdvisorsOfDegree<T>({ advisors, degreeType }: {
  advisors: List<Map<string, T>>,
  degreeType: keyof typeof DEGREE_TYPE_TO_DISPLAY
}) {
  const degreeTypeDisplay =
    degreeType === 'other' ? '' : `${DEGREE_TYPE_TO_DISPLAY[degreeType]} `;
  const label = pluralizeUnlessSingle(
    `${degreeTypeDisplay}Advisor`,
    advisors.size
  );
  return (
    <InlineDataList
      label={label}
      items={advisors}
      extractKey={getName}
      renderItem={renderAdvisor}
    />
  );
}

export default AdvisorsOfDegree;
