import React from 'react';
import { Button } from 'antd';

import ContentBox from './ContentBox';

type RunningDagsBoxProps = {
  dagFullUrl: string;
};

const RunningDagsBox = ({ dagFullUrl }: RunningDagsBoxProps) => (
  <ContentBox className="mb3" fullHeight={false} subTitle="Airflow DAGs">
    <div className="flex flex-column items-center">
      <Button className="w-75">
        <a href={dagFullUrl} target="_blank">
          See DAG Run
        </a>
      </Button>
    </div>
  </ContentBox>
);

export default RunningDagsBox;
