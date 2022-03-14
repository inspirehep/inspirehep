import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { List, Set } from 'immutable';
import { Checkbox } from 'antd';

function getRecordId(result) {
  return result.getIn(['metadata', 'control_number']);
}

function getClaimed(result) {
  return result.getIn(['metadata', 'curated_relation'], false);
}

function getCanClaim(result) {
  return result.getIn(['metadata', 'can_claim'], false);
}

function PublicationsSelectAll({
  publications,
  selection,
  onChange,
  disabled,
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

PublicationsSelectAll.propTypes = {
  publications: PropTypes.instanceOf(List),
  selection: PropTypes.instanceOf(Set).isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default PublicationsSelectAll;
