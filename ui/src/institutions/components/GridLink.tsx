import React from 'react';

// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../../common/components/ExternalLink.tsx';

type Props = {
    grid: string;
};

function GridLink({ grid }: Props) {
  const href = `//grid.ac/institutes/${grid}`;
  return (
    <span>
      GRID Record: <ExternalLink href={href}>{grid}</ExternalLink>
    </span>
  );
}

export default GridLink;
