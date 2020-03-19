import React from 'react';
import PropTypes from 'prop-types';

import ExternalLink from '../../common/components/ExternalLink';

function CollaborationLogo({ href, name }) {
  // collaboration logos are stored at `public` folder with below name format
  const src = `/collab-logo-${name}.png`;
  return (
    <ExternalLink href={href}>
      <img height={60} src={src} alt={name} />
    </ExternalLink>
  );
}

CollaborationLogo.propTypes = {
  name: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
};

export default CollaborationLogo;
