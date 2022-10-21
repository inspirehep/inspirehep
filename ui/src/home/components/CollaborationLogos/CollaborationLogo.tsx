import React from 'react';
import PropTypes from 'prop-types';

import LinkWithTargetBlank from '../../../common/components/LinkWithTargetBlank';

function CollaborationLogo({ href, name, src }: { href: string, name: string, src: string }) {
  return (
    <LinkWithTargetBlank href={href}>
      <img height={40} src={src} alt={name} />
    </LinkWithTargetBlank>
  );
}

CollaborationLogo.propTypes = {
  name: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
};

export default CollaborationLogo;
