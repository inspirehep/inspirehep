import React from 'react';
import { List } from 'immutable';
import InlineList, {
  SEPARATOR_MIDDLEDOT,
} from '../../common/components/InlineList';

type Props = {
    historicalData?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

function InstitutionsHistoricalDataList({ historicalData }: Props) {
  return (
    <InlineList
      label="Note"
      items={historicalData}
      separator={SEPARATOR_MIDDLEDOT}
    />
  );
}

export default InstitutionsHistoricalDataList;
