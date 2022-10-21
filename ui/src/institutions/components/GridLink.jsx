import React from 'react';
import PropTypes from 'prop-types';

import LinkWithTargetBlank from '../../common/components/LinkWithTargetBlank.tsx';

function GridLink({ grid }) {
  const href = `//grid.ac/institutes/${grid}`;
  return (
    <span>
      GRID Record: <LinkWithTargetBlank href={href}>{grid}</LinkWithTargetBlank>
    </span>
  );
}

GridLink.propTypes = {
  grid: PropTypes.string.isRequired,
};

export default GridLink;
