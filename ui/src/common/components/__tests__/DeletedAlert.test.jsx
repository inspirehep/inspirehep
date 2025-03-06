import React from 'react';
import { render } from '@testing-library/react';
import DeletedAlert from '../DeletedAlert';

describe('DeletedAlert', () => {
  it('renders DeletedAlert with correct type and message', () => {
    const { getByText, container } = render(<DeletedAlert />);
    expect(getByText('This record is deleted!')).toBeInTheDocument();
    const className = container.querySelector('.ant-alert-error');
    expect(className).toBeInTheDocument();
  });
});
