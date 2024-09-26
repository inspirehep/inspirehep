import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import Abstract from '../Abstract';

describe('Abstract', () => {
  it('renders with abstract', () => {
    const abstract = fromJS({
      source: 'arXiv',
      value: 'Test abstract',
    });
    const wrapper = shallow(<Abstract abstract={abstract} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('does not display abstractSource when it is null', () => {
    const abstract = fromJS({
      value: 'Test abstract',
    });
    const wrapper = shallow(<Abstract abstract={abstract} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render if abstract is null', () => {
    const wrapper = shallow(<Abstract />);
    expect(wrapper).toMatchSnapshot();
  });
});
