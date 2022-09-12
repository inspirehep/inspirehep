import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from 'antd';

function PublicationsSelect({
  onSelectClaimedPapers,
  onSelectUnclaimedPapers,
  onSelectPapers,
  claimed,
  disabled,
  checked,
  isOwnProfile,
}) {
  const onChange = (event) => {
    onSelectPapers(event);
    if (isOwnProfile && claimed) {
      onSelectClaimedPapers(event);
    } else if (isOwnProfile && !claimed) {
      onSelectUnclaimedPapers(event);
    }
  };

  return (
    <Checkbox
      onChange={(event) => {
        onChange(event);
      }}
      disabled={disabled}
      checked={checked}
    />
  );
}

PublicationsSelect.propTypes = {
  claimed: PropTypes.bool,
  onSelectClaimedPapers: PropTypes.func.isRequired,
  onSelectUnclaimedPapers: PropTypes.func.isRequired,
  onSelectPapers: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  checked: PropTypes.bool,
};

export default PublicationsSelect;
