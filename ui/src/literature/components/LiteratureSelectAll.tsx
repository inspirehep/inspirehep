import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { List, Set } from 'immutable';
import { Checkbox } from 'antd';

function getRecordId(result: any) {
  return result.getIn(['metadata', 'control_number']);
}

function LiteratureSelectAll({
  publications,
  selection,
  onChange
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
      checked={checked}
      onChange={(event) => {
        onChange(publications.map(getRecordId), event.target.checked);
      }}
    />
  );
}

LiteratureSelectAll.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  publications: PropTypes.instanceOf(List),
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Set' is not assignable to... Remove this comment to see the full error message
  selection: PropTypes.instanceOf(Set).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default LiteratureSelectAll;
