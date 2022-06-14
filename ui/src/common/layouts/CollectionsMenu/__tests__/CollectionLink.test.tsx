import React from 'react';
import { shallow } from 'enzyme';

import CollectionLink from '../CollectionLink';

describe('CollectionLink', () => {
  it('renders default', () => {
    const wrapper = shallow(<CollectionLink to="/literature" />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders active', () => {
    const wrapper = shallow(<CollectionLink to="/literature" active />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders new', () => {
    const wrapper = shallow(<CollectionLink to="/literature" newCollection />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders active and new', () => {
    const wrapper = shallow(
      <CollectionLink to="/literature" active newCollection />
    );

    expect(wrapper).toMatchSnapshot();
  });
});
