import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import InlineDataList, {
  SEPARATOR_MIDDLEDOT,
} from '../../common/components/InlineList';

function InstitutionsHistoricalDataList({ historicalData }) {
  return (
    <InlineDataList
      label="Note"
      items={historicalData}
      separator={SEPARATOR_MIDDLEDOT}
    />
  );
}

InstitutionsHistoricalDataList.propTypes = {
  historicalData: PropTypes.instanceOf(List),
};

export default InstitutionsHistoricalDataList;
