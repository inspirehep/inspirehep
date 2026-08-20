import { MouseEventHandler } from 'react';

import LinkLikeButton from './LinkLikeButton/LinkLikeButton';

const GoBackLink = ({
  children = 'go back',
  onClick,
}: {
  children?: string;
  onClick: MouseEventHandler<HTMLElement>;
}) => (
  <LinkLikeButton color="blue big" onClick={onClick} dataTestId="go-back-link">
    {children}
  </LinkLikeButton>
);

export default GoBackLink;
