import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import InstitutionHierarchyList from '../InstitutionHierarchyList';

describe('InstitutionHierarchyList', () => {
  it('renders', () => {
    const hierarchies = fromJS([
      {
        name: 'Name1',
        acronym: 'NA',
      },
      {
        name: 'Name2',
      },
    ]);
    const wrapper = shallow(
      <InstitutionHierarchyList hierarchies={hierarchies} />
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
