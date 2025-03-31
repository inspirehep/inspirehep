import React from 'react';
import { Row, Col } from 'antd';

import DocumentHead from '../../common/components/DocumentHead';
import { SEMINARS_NS } from '../../search/constants';

import SeminarSearchContainer from '../containers/SeminarSearchContainer';
import { SEARCH_PAGE_COL_SIZE_WITH_FACETS } from '../../common/constants';

const META_DESCRIPTION = 'Find seminars in High Energy Physics';
const TITLE = 'Seminars Search';

function SearchPage() {
  return (
    <>
      <DocumentHead title={TITLE} description={META_DESCRIPTION} />
      <Row>
        <Col {...SEARCH_PAGE_COL_SIZE_WITH_FACETS}>
          <SeminarSearchContainer namespace={SEMINARS_NS} enableDateFilter />
        </Col>
      </Row>
    </>
  );
}

export default SearchPage;
