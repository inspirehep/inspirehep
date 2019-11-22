import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ProceedingsAction from '../ProceedingsAction';

describe('ProceedingsAction', () => {
  it('renders proceedings', () => {
    const proceedings = fromJS([
      { control_number: '12345' },
      {
        control_number: '54321',
        publication_info: [{ journal_title: 'Journal 1' }],
      },
    ]);
    const wrapper = shallow(<ProceedingsAction proceedings={proceedings} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('renders single item', () => {
    const proceedings = fromJS([{ control_number: '12345' }]);
    const wrapper = shallow(<ProceedingsAction proceedings={proceedings} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
