import React, { useEffect } from 'react';
import { Col, Row } from 'antd';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

import ContentBox from '../../common/components/ContentBox';
import CitationSummaryGraphContainer from '../../common/containers/CitationSummaryGraphContainer';
import CitationSummaryTableContainer from '../../common/containers/CitationSummaryTableContainer';

function CitationSummaryBox({ query, onQueryChange, namespace }) {
  useEffect(
    () => {
      onQueryChange(query);
    },
    [query, onQueryChange]
  );

  return (
    <ContentBox subTitle="Citation Summary">
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
  query: PropTypes.instanceOf(Map),
  onQueryChange: PropTypes.func.isRequired,
  namespace: PropTypes.string.isRequired,
};

export default CitationSummaryBox;
