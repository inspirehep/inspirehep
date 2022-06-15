import React from 'react';
import { shallow } from 'enzyme';
import InstitutionPeople from '../InstitutionPeople';

describe('InstitutionPeople', () => {
  it('renders', () => {
    const recordId = 123;
    const wrapper = shallow(<InstitutionPeople recordId={recordId} />);
    expect(wrapper).toMatchSnapshot();
  });
});
