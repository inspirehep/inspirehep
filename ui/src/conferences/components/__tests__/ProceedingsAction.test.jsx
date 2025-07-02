import React from 'react';
import { render } from '@testing-library/react';
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
    const { asFragment } = render(
      <ProceedingsAction proceedings={proceedings} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders single item', () => {
    const proceedings = fromJS([{ control_number: '12345' }]);
    const { asFragment } = render(
      <ProceedingsAction proceedings={proceedings} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
