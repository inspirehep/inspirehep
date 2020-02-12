import React from 'react';
import PropTypes from 'prop-types';

import ExternalLink from './ExternalLink';

function OrcidProfileLink({ children, orcid, className }) {
  return (
    <ExternalLink className={className} href={`//orcid.org/${orcid}`}>
      {children || orcid}
    </ExternalLink>
  );
}

OrcidProfileLink.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  orcid: PropTypes.string.isRequired,
};

export default OrcidProfileLink;
