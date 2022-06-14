import React from 'react';
import PropTypes from 'prop-types';

// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../../../common/components/ExternalLink.tsx';

function CollaborationLogo({
  href,
  name,
  src
}: any) {
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
