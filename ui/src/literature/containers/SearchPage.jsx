import React from 'react';
import { Row, Col } from 'antd';

import LiteratureSearchContainer from './LiteratureSearchContainer';
import { LITERATURE_NS } from '../../reducers/search';
import DocumentHead from '../../common/components/DocumentHead';
import ExternalLink from '../../common/components/ExternalLink';

// TODO: move it out from containers
function SearchPage() {
  return (
    <>
      <DocumentHead title="Literature Search" />
      <Row>
        <Col xs={24} lg={22} xl={20} xxl={18}>
          <LiteratureSearchContainer
            namespace={LITERATURE_NS}
            noResultsTitle="0 Results"
            noResultsDescription={
              <em>
                Oops! You might want to check out our{' '}
                <ExternalLink href="https://labs.inspirehep.net/help/knowledge-base/inspire-paper-search/">
                  search tips
                </ExternalLink>
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
