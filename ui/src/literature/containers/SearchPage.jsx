import React from 'react';
import { Row, Col } from 'antd';

import LiteratureSearchContainer from './LiteratureSearchContainer';
import { LITERATURE_NS } from '../../search/constants';
import DocumentHead from '../../common/components/DocumentHead';
import ExternalLink from '../../common/components/ExternalLink';
import { PAPER_SEARCH_URL } from '../../common/constants';

const META_DESCRIPTION =
  'Find articles, conference papers, proceedings, books, theses, reviews, lectures and reports in High Energy Physics';
const TITLE = 'Literature Search';

// TODO: move it out from containers
function SearchPage() {
  return (
    <>
      <DocumentHead title={TITLE} description={META_DESCRIPTION} />
      <Row>
        <Col xs={24} lg={22} xl={20} xxl={18}>
          <LiteratureSearchContainer
            namespace={LITERATURE_NS}
            noResultsTitle="0 Results"
            noResultsDescription={
              <em>
                Oops! You might want to check out our{' '}
                <ExternalLink href={PAPER_SEARCH_URL}>search tips</ExternalLink>
                .
              </em>
            }
          />
        </Col>
      </Row>
    </>
  );
}

export default SearchPage;
