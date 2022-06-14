import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import InstitutionsNameVariantsList from '../InstitutionNameVariantsList';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('InstitutionNameVariantsList', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders', () => {
    const nameVariants = fromJS([
      {
        value: 'Name1',
      },
      {
        value: 'Name2',
      },
    ]);
    const wrapper = shallow(
      <InstitutionsNameVariantsList nameVariants={nameVariants} />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
