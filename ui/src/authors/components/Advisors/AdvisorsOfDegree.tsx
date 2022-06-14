import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import InlineList from '../../../common/components/InlineList/InlineList';
import pluralizeUnlessSingle from '../../../common/utils';
import { DEGREE_TYPE_TO_DISPLAY } from '../../../common/constants';
import Advisor from './Advisor';

function getName(advisor: any) {
  return advisor.get('name');
}

function renderAdvisor(advisor: any) {
  return <Advisor advisor={advisor} />;
}

function AdvisorsOfDegree({
  advisors,
  degreeType
}: any) {
  const degreeTypeDisplay =
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    degreeType === 'other' ? '' : `${DEGREE_TYPE_TO_DISPLAY[degreeType]} `;
  const label = pluralizeUnlessSingle(
    `${degreeTypeDisplay}Advisor`,
    advisors.size
  );
  return (
    <InlineList
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      label={label}
      items={advisors}
      extractKey={getName}
      renderItem={renderAdvisor}
    />
  );
}

AdvisorsOfDegree.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  advisors: PropTypes.instanceOf(List).isRequired,
  degreeType: PropTypes.string.isRequired,
};

export default AdvisorsOfDegree;
