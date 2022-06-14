import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { List, Set } from 'immutable';
import { Checkbox } from 'antd';

function getRecordId(result: any) {
  return result.getIn(['metadata', 'control_number']);
}

function getClaimed(result: any) {
  return result.getIn(['metadata', 'curated_relation'], false);
}

function getCanClaim(result: any) {
  return result.getIn(['metadata', 'can_claim'], false);
}

function PublicationsSelectAll({
  publications,
  selection,
  onChange,
  disabled
}: any) {
  const checked = useMemo(
    () =>
      publications &&
      publications.every((publication: any) => selection.has(getRecordId(publication))
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
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  publications: PropTypes.instanceOf(List),
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Set' is not assignable to... Remove this comment to see the full error message
  selection: PropTypes.instanceOf(Set).isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default PublicationsSelectAll;
