import React from 'react';
import PropTypes from 'prop-types';

import LinkWithTargetBlank from './LinkWithTargetBlank.tsx';

function OrcidProfileLink({ children, orcid, className }) {
  return (
    <LinkWithTargetBlank className={className} href={`//orcid.org/${orcid}`}>
      {children || orcid}
    </LinkWithTargetBlank>
  );
}

OrcidProfileLink.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  orcid: PropTypes.string.isRequired,
};

export default OrcidProfileLink;
