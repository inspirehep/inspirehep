import React from 'react';
import PropTypes from 'prop-types';

import ExternalLink from '../../../common/components/ExternalLink';

function CollaborationLogo({ href, name, src }: { href: string, name: string, src: string }) {
  return (
    <ExternalLink href={href}>
      <img height={40} src={src} alt={name} />
    </ExternalLink>
  );
}

CollaborationLogo.propTypes = {
  name: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
};

export default CollaborationLogo;
