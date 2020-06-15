import React from 'react';
import { Col, Row } from 'antd';
import PropTypes from 'prop-types';

import ContentBox from '../../../common/components/ContentBox';
import CitationSummaryGraphContainer from '../../../common/containers/CitationSummaryGraphContainer';
import CitationSummaryTableContainer from '../../../common/containers/CitationSummaryTableContainer';
import NewFeatureTag from '../../../common/components/NewFeatureTag';
import './CitationSummaryBox.scss';
import ExcludeSelfCitationsContainer from '../../containers/ExcludeSelfCitationsContainer';

function CitationSummaryBox({ namespace }) {
  return (
    <ContentBox subTitle="Citation Summary">
      <ExcludeSelfCitationsContainer namespace={namespace} />
      <NewFeatureTag className="without-margin-left" />
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

CitationSummaryBox.propTypes = {
  namespace: PropTypes.string.isRequired,
};

export default CitationSummaryBox;
