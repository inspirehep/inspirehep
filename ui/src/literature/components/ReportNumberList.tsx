import { List } from 'immutable';

import InlineDataList from '../../common/components/InlineList';

interface ReportNumberListProps {
  reportNumbers: List<any>;
  hideLabel?: boolean;
}

const ReportNumberList = ({
  reportNumbers,
  hideLabel = false,
}: ReportNumberListProps) => (
  <InlineDataList
    label={hideLabel ? undefined : 'Report numbers'}
    items={reportNumbers}
    extractKey={(reportNumber: any) => reportNumber.get('value')}
    renderItem={(reportNumber: any) => <span>{reportNumber.get('value')}</span>}
  />
);

export default ReportNumberList;
