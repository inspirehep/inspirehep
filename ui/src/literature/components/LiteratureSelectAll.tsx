import React, { useMemo } from 'react';
import { List, Set } from 'immutable';
import { Checkbox } from 'antd';

function getRecordId(result: $TSFixMe) {
  return result.getIn(['metadata', 'control_number']);
}

type Props = {
    publications?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
    selection: $TSFixMe; // TODO: PropTypes.instanceOf(Set)
    onChange: $TSFixMeFunction;
};

function LiteratureSelectAll({ publications, selection, onChange }: Props) {
  const checked = useMemo(
    () =>
      publications &&
      publications.every((publication: $TSFixMe) => selection.has(getRecordId(publication))
      ),
    [publications, selection]
  );
  return (
    <Checkbox
      checked={checked}
      onChange={(event) => {
        onChange(publications.map(getRecordId), event.target.checked);
      }}
    />
  );
}

export default LiteratureSelectAll;
