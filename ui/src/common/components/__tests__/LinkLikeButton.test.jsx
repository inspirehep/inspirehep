import { render } from '@testing-library/react';

import LinkLikeButton from '../LinkLikeButton/LinkLikeButton';

describe('LinkLikeButton', () => {
  it('renders with required props', () => {
    const { getByRole } = render(
      <LinkLikeButton onClick={jest.fn()}>example</LinkLikeButton>
    );
    expect(getByRole('button', { name: 'example' })).toBeInTheDocument();
  });

  it('renders with dataTestId', () => {
    const { getByTestId } = render(
      <LinkLikeButton onClick={jest.fn()} dataTestId="example-button">
        example
      </LinkLikeButton>
    );
    expect(getByTestId('example-button')).toBeInTheDocument();
  });

  it('calls onClick when anchor is clicked', () => {
    const onClick = jest.fn();
    const { getByRole } = render(
      <LinkLikeButton onClick={onClick}>example</LinkLikeButton>
    );

    getByRole('button').click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
