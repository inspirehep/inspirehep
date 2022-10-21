import React from 'react';
import PropTypes from 'prop-types';

import LinkWithTargetBlank from '../../common/components/LinkWithTargetBlank.tsx';

function RorLink({ ror }) {
  return (
    <span>
      ROR Record: <LinkWithTargetBlank href={ror}>{ror}</LinkWithTargetBlank>
    </span>
  );
}

RorLink.propTypes = {
  ror: PropTypes.string.isRequired,
};

export default RorLink;
