import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import InlineList, {
  SEPARATOR_MIDDLEDOT,
} from '../../common/components/InlineList';

function InstitutionsHistoricalDataList({
  historicalData
}: any) {
  return (
    <InlineList
      /* @ts-ignore */
      items={historicalData}
      separator={SEPARATOR_MIDDLEDOT}
    />
  );
}

InstitutionsHistoricalDataList.propTypes = {
  /* @ts-ignore */
  historicalData: PropTypes.instanceOf(List),
};

export default InstitutionsHistoricalDataList;
