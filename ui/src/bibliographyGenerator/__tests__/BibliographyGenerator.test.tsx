import React from 'react';
import { shallow } from 'enzyme';
import { Alert } from 'antd';
import { fromJS } from 'immutable';

import BibliographyGenerator from '../BibliographyGenerator';

describe('BibliographyGenerator', () => {
  it('renders', () => {
    const wrapper = shallow(<BibliographyGenerator onSubmit={jest.fn()} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders citationErrors', () => {
    const citationErrors = fromJS([
      {
        message: 'Error 1',
      },
      {
        message: 'Error 2',
      },
    ]);
    const wrapper = shallow(
      <BibliographyGenerator
        onSubmit={jest.fn()}
        citationErrors={citationErrors}
      />
    );
    expect(wrapper.find(Alert)).toHaveLength(2);
  });
});
