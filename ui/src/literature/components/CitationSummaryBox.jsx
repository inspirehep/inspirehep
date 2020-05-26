import React from 'react';
import { Col, Row, Checkbox } from 'antd';
import PropTypes from 'prop-types';

import ContentBox from '../../common/components/ContentBox';
import CitationSummaryGraphContainer from '../../common/containers/CitationSummaryGraphContainer';
import CitationSummaryTableContainer from '../../common/containers/CitationSummaryTableContainer';
import LabelWithHelp from '../../common/components/LabelWithHelp';

const EXCLUDE_SELF_CITATIONS_HELP = (
  <p>
    Self-citations are citations from the same collaboration or any of the
    authors of the paper being cited.{' '}
    <a href="https://inspirehep.net/help/knowledge-base/citation-metrics/">
      Learn more.
    </a>
  </p>
);

function CitationSummaryBox({
  namespace,
  excludeSelfCitations,
  onExcludeSelfCitationsChange,
}) {
  return (
    <ContentBox subTitle="Citation Summary">
      <Checkbox
        onChange={event => onExcludeSelfCitationsChange(event.target.checked)}
        checked={excludeSelfCitations}
      >
        <LabelWithHelp
          label="Exclude self-citations"
          help={EXCLUDE_SELF_CITATIONS_HELP}
        />
      </Checkbox>
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
  excludeSelfCitations: PropTypes.bool.isRequired,
  onExcludeSelfCitationsChange: PropTypes.func.isRequired,
};

export default CitationSummaryBox;
