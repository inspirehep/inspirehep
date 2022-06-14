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
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      label="Note"
      items={historicalData}
      separator={SEPARATOR_MIDDLEDOT}
    />
  );
}

InstitutionsHistoricalDataList.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  historicalData: PropTypes.instanceOf(List),
};

export default InstitutionsHistoricalDataList;
