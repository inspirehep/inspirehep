import { render } from '@testing-library/react';

import SecondaryButton from '../SecondaryButton';

describe('SecondaryButton', () => {
  it('renders button', () => {
    const { asFragment } = render(
      <SecondaryButton onClick={jest.fn()}>Test</SecondaryButton>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls onClick when button is clicked', () => {
    const onClick = jest.fn();
    const { getByRole } = render(
      <SecondaryButton onClick={onClick}>Test</SecondaryButton>
    );
    getByRole('button').click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
