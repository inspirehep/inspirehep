import React from 'react';
import PropTypes from 'prop-types';

import ExternalLink from '../../../common/components/ExternalLink.tsx';

function CollaborationLogo({ href, name, src }) {
  return (
    <ExternalLink href={href}>
      <img height={60} src={src} alt={name} />
    </ExternalLink>
  );
}

CollaborationLogo.propTypes = {
  name: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
};

export default CollaborationLogo;
