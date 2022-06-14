import React from 'react';
import PropTypes from 'prop-types';

// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../../common/components/ExternalLink.tsx';

function GridLink({
  grid
}: any) {
  const href = `//grid.ac/institutes/${grid}`;
  return (
    <span>
      GRID Record: <ExternalLink href={href}>{grid}</ExternalLink>
    </span>
  );
}

GridLink.propTypes = {
  grid: PropTypes.string.isRequired,
};

export default GridLink;
