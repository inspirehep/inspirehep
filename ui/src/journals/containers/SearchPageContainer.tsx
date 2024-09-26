import React from 'react';
import { connect, RootStateOrAny } from 'react-redux';
import { Row, Col } from 'antd';
import { Map } from 'immutable';

import PaginationContainer from '../../common/containers/PaginationContainer';
import ResultsContainer from '../../common/containers/ResultsContainer';
import NumberOfResultsContainer from '../../common/containers/NumberOfResultsContainer';
import LoadingOrChildren from '../../common/components/LoadingOrChildren';
import DocumentHead from '../../common/components/DocumentHead';
import { JOURNALS_NS } from '../../search/constants';
import { SEARCH_PAGE_GUTTER } from '../../common/constants';
import { JournalItem } from '../components/JournalItem';
import { isCataloger, isSuperUser } from '../../common/authorization';
import { APIButton } from '../../common/components/APIButton';

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

export const JournalSearchPage = ({
  loading,
  isCatalogerLoggedIn,
  isSuperUserLoggedIn
}: {
  loading: boolean;
  isCatalogerLoggedIn: boolean;
  isSuperUserLoggedIn: boolean;
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
                <NumberOfResultsContainer namespace={JOURNALS_NS} />
                {isSuperUserLoggedIn && (
                  <APIButton url={window.location.href} />
                )}
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <ResultsContainer
                  namespace={JOURNALS_NS}
                  renderItem={(item: Journal) =>
                    renderJournalItem(item, isCatalogerLoggedIn)
                  }
                />
                <PaginationContainer namespace={JOURNALS_NS} />
              </Col>
            </Row>
          </LoadingOrChildren>
        </Col>
      </Row>
    </>
  );
};

const stateToProps = (state: RootStateOrAny) => ({
  loading: state.search.getIn(['namespaces', JOURNALS_NS, 'loading']),
  isCatalogerLoggedIn: isCataloger(state.user.getIn(['data', 'roles'])),
  isSuperUserLoggedIn: isSuperUser(state.user.getIn(['data', 'roles'])),
});

export default connect(stateToProps)(JournalSearchPage);
