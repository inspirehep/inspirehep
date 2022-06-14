import React, { useMemo } from 'react';
import { List, Set } from 'immutable';
import { Checkbox } from 'antd';

function getRecordId(result: $TSFixMe) {
  return result.getIn(['metadata', 'control_number']);
}

function getClaimed(result: $TSFixMe) {
  return result.getIn(['metadata', 'curated_relation'], false);
}

function getCanClaim(result: $TSFixMe) {
  return result.getIn(['metadata', 'can_claim'], false);
}

type Props = {
    publications?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
    selection: $TSFixMe; // TODO: PropTypes.instanceOf(Set)
    onChange: $TSFixMeFunction;
    disabled?: boolean;
};

function PublicationsSelectAll({ publications, selection, onChange, disabled, }: Props) {
  const checked = useMemo(
    () =>
      publications &&
      publications.every((publication: $TSFixMe) => selection.has(getRecordId(publication))
      ),
    [publications, selection]
  );
  return (
    <Checkbox
      disabled={disabled}
      checked={checked}
      onChange={(event) => {
        onChange(
          publications.map(getRecordId),
          publications.map(getClaimed),
          publications.map(getCanClaim),
          event.target.checked
        );
      }}
    />
  );
}

export default PublicationsSelectAll;
