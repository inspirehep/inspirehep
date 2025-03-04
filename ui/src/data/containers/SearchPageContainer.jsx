import React from 'react';
import { Col, Row } from 'antd';
import DocumentHead from '../../common/components/DocumentHead';
import DataSearchPageContainer from './DataSearchPageContainer';
import { DATA_NS } from '../../search/constants';

const META_DESCRIPTION = 'Find data in High Energy Physics';
const TITLE = 'Data Search';

const SearchPage = () => (
  <>
    <DocumentHead title={TITLE} description={META_DESCRIPTION} />
    <Row>
      <Col xs={24} lg={22} xl={20} xxl={18}>
        <DataSearchPageContainer namespace={DATA_NS} page="Data search" />
      </Col>
    </Row>
  </>
);

export default SearchPage;
