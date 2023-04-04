import React, { MouseEventHandler } from 'react';

import SecondaryButton from './SecondaryButton';

const ExpandListToggle = ({
  size,
  limit,
  onToggle,
  expanded,
  expandLabel,
}: {
  size: number;
  limit: number;
  onToggle: MouseEventHandler<HTMLButtonElement>;
  expanded: boolean;
  expandLabel: string;
}) => {
  if (size <= limit) {
    return null;
  }

  const buttonText = expanded ? 'Hide' : `${expandLabel} (${size})`;
  return <SecondaryButton onClick={onToggle}>{buttonText}</SecondaryButton>;
};

ExpandListToggle.defaultProps = {
  expandLabel: 'Show all',
};

export default ExpandListToggle;
