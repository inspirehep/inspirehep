import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ProceedingsAction from '../ProceedingsAction';

describe('ProceedingsAction', () => {
  it('renders proceedings', () => {
    const proceedings = fromJS([
      { record: { $ref: 'https://localhost:3000/api/literature/12345' } },
      {
        record: { $ref: 'https://localhost:3000/api/literature/54321' },
        publication_info: [{ journal_title: 'Journal 1' }],
      },
    ]);
    const wrapper = shallow(<ProceedingsAction proceedings={proceedings} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('renders single item', () => {
    const proceedings = fromJS([
      { record: { $ref: 'https://localhost:3000/literature/12345' } },
    ]);
    const wrapper = shallow(<ProceedingsAction proceedings={proceedings} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
