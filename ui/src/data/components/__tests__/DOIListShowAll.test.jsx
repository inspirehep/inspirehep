import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import DOIListShowAll from '../DOIListShowAll';

describe('DOIListShowAll', () => {
  it('renders correctly with default props', () => {
    const wrapper = shallow(<DOIListShowAll />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with data and other dois', () => {
    const dois = fromJS([
      { material: 'data', value: 'doi1' },
      { material: 'data', value: 'doi2' },
      { material: 'article', value: 'doi3' },
    ]);
    const wrapper = shallow(<DOIListShowAll dois={dois} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with dataDois only', () => {
    const dois = fromJS([
      { material: 'data', value: 'doi1' },
      { material: 'data', value: 'doi2' },
    ]);
    const wrapper = shallow(<DOIListShowAll dois={dois} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with no dataDois', () => {
    const wrapper = shallow(<DOIListShowAll dois={fromJS([])} />);
    expect(wrapper).toMatchSnapshot();
  });
});