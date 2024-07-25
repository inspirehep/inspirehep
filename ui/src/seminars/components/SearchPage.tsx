import React from 'react';
import { Row, Col } from 'antd';

import DocumentHead from '../../common/components/DocumentHead';
import { SEMINARS_NS } from '../../search/constants';

import SeminarSearchContainer from '../containers/SeminarSearchContainer';

const META_DESCRIPTION = 'Find seminars in High Energy Physics';
const TITLE = 'Seminars Search';

function SearchPage() {
  return (
    <>
      <DocumentHead title={TITLE} description={META_DESCRIPTION} />
      <Row>
        <Col xs={24} lg={22} xl={20} xxl={18}>
          <SeminarSearchContainer namespace={SEMINARS_NS} enableDateFilter />
        </Col>
      </Row>
    </>
  );
}

export default SearchPage;
