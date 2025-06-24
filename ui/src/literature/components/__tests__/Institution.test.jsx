import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import Institution from '../Institution';

describe('Institution', () => {
  it('renders if institution has name', () => {
    const institution = fromJS({
      name: 'CERN',
    });
    const { asFragment } = render(<Institution institution={institution} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders empty if instution does not has name', () => {
    const institution = fromJS({});
    const { asFragment } = render(<Institution institution={institution} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
