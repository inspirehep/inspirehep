import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { List, Set } from 'immutable';
import { Checkbox } from 'antd';

function getRecordId(result) {
  return result.getIn(['metadata', 'control_number']);
}

function PublicationsSelectAll({ publications, selection, onChange }) {
  const checked = useMemo(
    () =>
      publications &&
      publications.every(publication =>
        selection.has(getRecordId(publication))
      ),
    [publications, selection]
  );
  return (
    <Checkbox
      checked={checked}
      onChange={event => {
        onChange(publications.map(getRecordId), event.target.checked);
      }}
    />
  );
}

PublicationsSelectAll.propTypes = {
  publications: PropTypes.instanceOf(List),
  selection: PropTypes.instanceOf(Set).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default PublicationsSelectAll;
