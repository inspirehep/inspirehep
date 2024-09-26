import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import InstitutionsNameVariantsList from '../InstitutionNameVariantsList';

describe('InstitutionNameVariantsList', () => {
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
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
