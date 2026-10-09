import { Button } from 'antd';

import ContentBox from './ContentBox';

type RunningDagsBoxProps = {
  dagFullUrl: string;
};

const RunningDagsBox = ({ dagFullUrl }: RunningDagsBoxProps) => (
  <ContentBox className="mb3" fullHeight={false} subTitle="Airflow DAGs">
    <div className="flex flex-column items-center">
      <Button
        className="w-75"
        href={dagFullUrl}
        target="_blank"
        rel="noreferrer"
      >
        See DAG Run
      </Button>
    </div>
  </ContentBox>
);

export default RunningDagsBox;
