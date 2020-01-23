import React, { useEffect } from 'react';
import { Col, Row } from 'antd';
import PropTypes from 'prop-types';

import ContentBox from '../../common/components/ContentBox';
import { LITERATURE_NS } from '../../reducers/search';
import CitationSummaryGraphContainer from '../../common/containers/CitationSummaryGraphContainer';
import CitationSummaryTableContainer from '../../common/containers/CitationSummaryTableContainer';

function CitationSummaryBox({ query, onQueryChange }) {
  useEffect(
    () => {
      onQueryChange(query);
    },
    [query, onQueryChange]
  );

  return (
    <ContentBox subTitle="Citation Summary">
      <Row gutter={{ xs: 0, lg: 32 }}>
        <Col xs={24} lg={7}>
          <CitationSummaryTableContainer />
        </Col>
        <Col xs={24} lg={17}>
          <CitationSummaryGraphContainer namespace={LITERATURE_NS} />
        </Col>
      </Row>
    </ContentBox>
  );
}

CitationSummaryBox.propTypes = {
  query: PropTypes.object.isRequired,
  onQueryChange: PropTypes.func.isRequired,
};

export default CitationSummaryBox;
