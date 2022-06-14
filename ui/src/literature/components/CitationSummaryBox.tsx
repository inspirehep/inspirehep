import React from 'react';
import { Col, Row } from 'antd';

import ContentBox from '../../common/components/ContentBox';
import CitationSummaryGraphContainer from '../../common/containers/CitationSummaryGraphContainer';
import CitationSummaryTableContainer from '../../common/containers/CitationSummaryTableContainer';
import ExcludeSelfCitationsContainer from '../containers/ExcludeSelfCitationsContainer';

type Props = {
    namespace: string;
};

function CitationSummaryBox({ namespace }: Props) {
  return (
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    <ContentBox subTitle="Citation Summary">
      <ExcludeSelfCitationsContainer namespace={namespace} />

      <Row gutter={{ xs: 0, lg: 32 }}>
        <Col span={24}>
          <CitationSummaryTableContainer />
        </Col>
        <Col span={24}>
          <CitationSummaryGraphContainer namespace={namespace} />
        </Col>
      </Row>
    </ContentBox>
  );
}

export default CitationSummaryBox;
