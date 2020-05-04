import React, { useEffect } from 'react';
import { Col, Row, Checkbox } from 'antd';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

import ContentBox from '../../common/components/ContentBox';
import CitationSummaryGraphContainer from '../../common/containers/CitationSummaryGraphContainer';
import CitationSummaryTableContainer from '../../common/containers/CitationSummaryTableContainer';
import AuthorizedContainer from '../../common/containers/AuthorizedContainer';
import { SUPERUSER_OR_CATALOGER } from '../../common/authorization';

function CitationSummaryBox({
  query,
  onQueryChange,
  namespace,
  excludeSelfCitations,
  onExcludeSelfCitationsChange,
}) {
  useEffect(
    () => {
      onQueryChange(query, excludeSelfCitations);
    },
    [query, onQueryChange, excludeSelfCitations]
  );

  return (
    <ContentBox subTitle="Citation Summary">
      <AuthorizedContainer authorizedRoles={SUPERUSER_OR_CATALOGER}>
        <Checkbox
          onChange={event => onExcludeSelfCitationsChange(event.target.checked)}
          checked={excludeSelfCitations}
        >
          Exclude self-citations
        </Checkbox>
      </AuthorizedContainer>
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
  excludeSelfCitations: PropTypes.bool.isRequired,
  onExcludeSelfCitationsChange: PropTypes.func.isRequired,
};

export default CitationSummaryBox;
