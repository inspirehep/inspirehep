import React from 'react';
import { Col, Row } from 'antd';
import { connect } from 'react-redux';

import DocumentHead from '../../common/components/DocumentHead';
import DataSearchPageContainer from './DataSearchPageContainer';
import { DATA_NS } from '../../search/constants';
import { columnSize } from '../../common/utils';

const META_DESCRIPTION = 'Find data in High Energy Physics';
const TITLE = 'Data Search';

const SearchPage = ({ numberOfResults }) => (
  <>
    <DocumentHead title={TITLE} description={META_DESCRIPTION} />
    <Row>
      <Col {...columnSize(numberOfResults, true)}>
        <DataSearchPageContainer namespace={DATA_NS} page="Data search" />
      </Col>
    </Row>
  </>
);

const stateToProps = (state) => ({
  numberOfResults: state.search.getIn(['namespaces', DATA_NS, 'total']),
});

export default connect(stateToProps)(SearchPage);
