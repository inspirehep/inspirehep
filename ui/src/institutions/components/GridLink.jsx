import React from 'react';
import PropTypes from 'prop-types';

import ExternalLink from '../../common/components/ExternalLink';

function GridLink({ grid }) {
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
