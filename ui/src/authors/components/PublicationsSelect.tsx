import React from 'react';
import { Checkbox } from 'antd';

type Props = {
    claimed?: boolean;
    canClaim?: boolean;
    onSelectPapersUserCanNotClaim: $TSFixMeFunction;
    onSelectClaimedPapers: $TSFixMeFunction;
    onSelectUnclaimedPapers: $TSFixMeFunction;
    onSelectPapers: $TSFixMeFunction;
    disabled?: boolean;
    checked?: boolean;
};

function PublicationsSelect({ onSelectPapersUserCanNotClaim, onSelectClaimedPapers, onSelectUnclaimedPapers, onSelectPapers, claimed, canClaim, disabled, checked, }: Props) {
  const onChange = (event: $TSFixMe) => {
    onSelectPapers(event);
    if (!canClaim) {
      onSelectPapersUserCanNotClaim(event);
    }
    if (claimed) {
      onSelectClaimedPapers(event);
    } else if (!claimed && canClaim) {
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

export default PublicationsSelect;
