import React from 'react';
import { List } from 'immutable';
import InlineList from '../../../common/components/InlineList/InlineList';
import pluralizeUnlessSingle from '../../../common/utils';
import { DEGREE_TYPE_TO_DISPLAY } from '../../../common/constants';
import Advisor from './Advisor';

function getName(advisor: $TSFixMe) {
  return advisor.get('name');
}

function renderAdvisor(advisor: $TSFixMe) {
  return <Advisor advisor={advisor} />;
}

type Props = {
    advisors: $TSFixMe; // TODO: PropTypes.instanceOf(List)
    degreeType: string;
};

function AdvisorsOfDegree({ advisors, degreeType }: Props) {
  const degreeTypeDisplay =
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
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

export default AdvisorsOfDegree;
