import React from 'react';
import PropTypes from 'prop-types';

import ExternalLink from '../../common/components/ExternalLink';

function RorLink({ ror }) {
  return (
    <span>
      ROR Record: <ExternalLink href={ror}>{ror}</ExternalLink>
    </span>
  );
}

RorLink.propTypes = {
  ror: PropTypes.string.isRequired,
};

export default RorLink;
