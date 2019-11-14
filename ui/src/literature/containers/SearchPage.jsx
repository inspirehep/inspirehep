import React from 'react';
import { Row, Col } from 'antd';

import LiteratureSearchContainer from './LiteratureSearchContainer';
import { LITERATURE_NS } from '../../reducers/search';
import DocumentHead from '../../common/components/DocumentHead';

// TODO: move it out from containers
function SearchPage() {
  return (
    <>
      <DocumentHead title="Literature Search" />
      <Row>
        <Col xs={24} lg={22} xl={20} xxl={18}>
          <LiteratureSearchContainer namespace={LITERATURE_NS} />
        </Col>
      </Row>
    </>
  );
}

export default SearchPage;
