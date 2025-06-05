import React from 'react';
import { render } from '@testing-library/react';

import ModalSuccessResult from '../ModalSuccessResult';

describe('ModalSuccessResult', () => {
  it('renders with children', () => {
    const { getByText } = render(
      <ModalSuccessResult>
        <span>Successfully did the thing</span>
      </ModalSuccessResult>
    );
    expect(getByText('Successfully did the thing')).toBeInTheDocument();
  });
});
