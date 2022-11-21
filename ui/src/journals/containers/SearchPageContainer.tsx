import React from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'antd';
import { List, Map } from 'immutable';

import PaginationContainer from '../../common/containers/PaginationContainer';
import ResultsContainer from '../../common/containers/ResultsContainer';
import NumberOfResultsContainer from '../../common/containers/NumberOfResultsContainer';
import LoadingOrChildren from '../../common/components/LoadingOrChildren';
import DocumentHead from '../../common/components/DocumentHead';
import { JOURNALS_NS } from '../../search/constants';
import { SEARCH_PAGE_GUTTER } from '../../common/constants';
import { JournalItem } from '../components/JournalItem';
import { isCataloger } from '../../common/authorization';

const META_DESCRIPTION = 'Find journals publishing about High Energy Physics';
const TITLE = 'Journals Search';

export interface JournalMetadata {
  short_title: string;
  journal_title: string;
  urls: string[];
  control_number: number;
  publisher: string[];
  number_of_papers: number;
  public_notes: string[];
  title_variants: string[];
}

export interface Journal {
  get: (metadata: string) => {
    get: (metadataKey: keyof JournalMetadata) => Map<keyof JournalMetadata, JournalMetadata[keyof JournalMetadata]>;
  };
}

interface RootState {
  search: {
    getIn: (values: [string, string, string]) => boolean;
  };
  user: {
    getIn: (values: [string, string]) => List<string>;
  };
}

export const JournalSearchPage = ({
  loading,
  isCatalogerLoggedIn,
}: {
  loading: boolean;
  isCatalogerLoggedIn: boolean;
}) => {
  const renderJournalItem = (result: Journal, correctUserRole: boolean) => (
    <JournalItem result={result} isCatalogerLoggedIn={correctUserRole} />
  );

  return (
    <>
      <DocumentHead title={TITLE} description={META_DESCRIPTION} />
      <Row className="mt3" gutter={SEARCH_PAGE_GUTTER} justify="center">
        <Col xs={24} lg={16} xl={16} xxl={14}>
          <LoadingOrChildren loading={loading}>
            <Row>
              <Col>
              {/* @ts-ignore */}
                <NumberOfResultsContainer namespace={JOURNALS_NS} />
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <ResultsContainer
                  // @ts-ignore
                  namespace={JOURNALS_NS}
                  // @ts-ignore
                  renderItem={(item) =>
                    renderJournalItem(item, isCatalogerLoggedIn)
                  }
                />
                {/* @ts-ignore */}
                <PaginationContainer namespace={JOURNALS_NS} />
              </Col>
            </Row>
          </LoadingOrChildren>
        </Col>
      </Row>
    </>
  );
};

const stateToProps = (state: RootState) => ({
  loading: state.search.getIn(['namespaces', JOURNALS_NS, 'loading']),
  isCatalogerLoggedIn: isCataloger(state.user.getIn(['data', 'roles'])),
});

export default connect(stateToProps)(JournalSearchPage);
