import React from 'react';
import { Radio } from 'antd';
import { shallow } from 'enzyme';
import { Map } from 'immutable';

import AuthorResult from '../AuthorResult';

describe('AuthorResult', () => {
  it('renders', () => {
    const authors = Map({
      full_name: 'Test, A',
      record: Map({
        $ref: 'https://inspirebeta.net/api/authors/1016091',
      }),
    });

    const wrapper = shallow(<AuthorResult item={authors} page="Page" />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correct value if author record exists', () => {
    const authors = Map({
      full_name: 'Test, A',
      record: Map({
        $ref: 'https://inspirebeta.net/api/authors/1016091',
      }),
    });

    const wrapper = shallow(<AuthorResult item={authors} page="Page" />);

    expect(wrapper.find(Radio)).toHaveProp({
      value: 1016091,
      disabled: false,
    });
  });

  it('renders undefined value if no author record doesnt exist', () => {
    const authors = Map({
      full_name: 'Test, A',
    });

    const wrapper = shallow(<AuthorResult item={authors} page="Page" />);

    expect(wrapper.find(Radio)).toHaveProp({
      value: undefined,
      disabled: true,
    });
  });
});
