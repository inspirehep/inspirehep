import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from 'antd';

function PublicationsSelect({
  onSelectPapersUserCanNotClaim,
  onSelectClaimedPapers,
  onSelectUnclaimedPapers,
  onSelectPapers,
  claimed,
  canClaim,
}) {
  const onChange = (event) => {
    onSelectPapers(event);
    if (!canClaim) {
      onSelectPapersUserCanNotClaim(event);
    }
    if (claimed) {
      onSelectClaimedPapers(event);
    } else {
      onSelectUnclaimedPapers(event);
    }
  };
  return (
    <Checkbox
      onChange={(event) => {
        onChange(event);
      }}
    />
  );
}

PublicationsSelect.propTypes = {
  claimed: PropTypes.bool,
  canClaim: PropTypes.bool,
  onSelectPapersUserCanNotClaim: PropTypes.func.isRequired,
  onSelectClaimedPapers: PropTypes.func.isRequired,
  onSelectUnclaimedPapers: PropTypes.func.isRequired,
  onSelectPapers: PropTypes.func.isRequired,
};

export default PublicationsSelect;
