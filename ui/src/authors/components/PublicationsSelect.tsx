import React from 'react';
import { Checkbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

function PublicationsSelect({
  onSelectClaimedPapers,
  onSelectUnclaimedPapers,
  onSelectPapers,
  claimed,
  disabled,
  checked,
  isOwnProfile,
}: {
  onSelectClaimedPapers: Function;
  onSelectUnclaimedPapers: Function;
  onSelectPapers: Function;
  claimed: boolean;
  disabled: boolean;
  checked: boolean;
  isOwnProfile: boolean;
}) {
  const onChange = (event: CheckboxChangeEvent) => {
    onSelectPapers(event);
    if (isOwnProfile && claimed) {
      onSelectClaimedPapers(event);
    } else if (isOwnProfile && !claimed) {
      onSelectUnclaimedPapers(event);
    }
  };

  return (
    <Checkbox
      onChange={(event: CheckboxChangeEvent) => {
        onChange(event);
      }}
      disabled={disabled}
      checked={checked}
    />
  );
}

export default PublicationsSelect;
