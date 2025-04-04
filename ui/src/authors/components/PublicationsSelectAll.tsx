import React, { useMemo } from 'react';
import { List, Set } from 'immutable';
import { Checkbox } from 'antd';

function getRecordId<T>(result: {
  getIn: (args: string[], arg?: boolean) => T;
}) {
  return result.getIn(['metadata', 'control_number']);
}

function getClaimed<T>(result: {
  getIn: (args: string[], arg?: boolean) => T;
}) {
  return result.getIn(['metadata', 'curated_relation'], false);
}

function getCanClaim<T>(result: {
  getIn: (args: string[], arg?: boolean) => T;
}) {
  return result.getIn(['metadata', 'can_claim'], false);
}

function PublicationsSelectAll<T>({
  publications,
  selection,
  onChange,
  disabled,
}: {
  publications: List<any>;
  selection: Set<T>;
  onChange: Function;
  disabled?: boolean;
}) {
  const checked = useMemo(
    () =>
      publications &&
      publications.every((publication) =>
        selection.has(getRecordId(publication))
      ),
    [publications, selection]
  );
  return (
    <Checkbox
      disabled={disabled}
      checked={checked}
      data-test-id="select-all-publications"
      data-testid="select-all-publications"
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
