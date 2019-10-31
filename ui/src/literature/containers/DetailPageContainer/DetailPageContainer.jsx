import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col, Tabs } from 'antd';
import { Map, List } from 'immutable';
import classNames from 'classnames';

import './DetailPage.scss';
import {
  fetchLiterature,
  fetchLiteratureAuthors,
  fetchLiteratureReferences,
} from '../../../actions/literature';
import Abstract from '../../components/Abstract';
import ArxivEprintList from '../../components/ArxivEprintList';
import FullTextLinksAction from '../../components/FullTextLinksAction';
import EditRecordAction from '../../../common/components/EditRecordAction';
import DOIList from '../../components/DOIList';
import AuthorsAndCollaborations from '../../../common/components/AuthorsAndCollaborations';
import ExternalSystemIdentifierList from '../../components/ExternalSystemIdentifierList';
import ContentBox from '../../../common/components/ContentBox';
import LiteratureDate from '../../components/LiteratureDate';
import KeywordList from '../../../common/components/KeywordList';
import PublicationInfoList from '../../../common/components/PublicationInfoList';
import ReportNumberList from '../../components/ReportNumberList';
import ThesisInfo from '../../components/ThesisInfo';
import IsbnList from '../../components/IsbnList';
import ConferenceInfoList from '../../components/ConferenceInfoList';
import NumberOfPages from '../../components/NumberOfPages';
import CitationListContainer from '../../../common/containers/CitationListContainer';
import TabNameWithCount from '../../../common/components/TabNameWithCount';
import AcceleratorExperimentList from '../../components/AcceleratorExperimentList';
import LiteratureTitle from '../../../common/components/LiteratureTitle';
import CiteModalActionContainer from '../CiteModalActionContainer';
import DocumentHead from '../../../common/components/DocumentHead';
import { fetchCitationsByYear } from '../../../actions/citations';
import CitationsByYearGraphContainer from '../../../common/containers/CitationsByYearGraphContainer';
import Figures from '../../components/Figures';
import RequireOneOf from '../../../common/components/RequireOneOf';
import ReferenceListContainer from '../../../common/containers/ReferenceListContainer';
import PublicNotesList from '../../../common/components/PublicNotesList';

class DetailPage extends Component {
  componentDidMount() {
    this.dispatchFetchActions();
  }

  componentDidUpdate(prevProps) {
    const prevRecordId = prevProps.match.params.id;
    if (this.recordId !== prevRecordId) {
      this.dispatchFetchActions();
      window.scrollTo(0, 0);
    }
  }

  get recordId() {
    const { match } = this.props;
    return match.params.id;
  }

  dispatchFetchActions() {
    const { dispatch } = this.props;
    dispatch(fetchLiterature(this.recordId));
    dispatch(fetchLiteratureReferences(this.recordId));
    dispatch(fetchLiteratureAuthors(this.recordId));
    dispatch(fetchCitationsByYear({ q: `recid:${this.recordId}` }));
  }

  render() {
    const {
      authors,
      citationCount,
      loadingCitations,
      record,
      loading,
      referencesCount,
    } = this.props;

    const metadata = record.get('metadata');
    if (!metadata) {
      return null; // FIXME: `loading` is state is never rendered
    }

    const title = metadata.getIn(['titles', 0]);
    const date = metadata.get('date');
    const recordId = metadata.get('control_number');
    const thesisInfo = metadata.get('thesis_info');
    const isbns = metadata.get('isbns');
    const publicationInfo = metadata.get('publication_info');
    const conferenceInfo = metadata.get('conference_info');
    const eprints = metadata.get('arxiv_eprints');
    const publicNotes = metadata.get('public_notes');
    const dois = metadata.get('dois');
    const reportNumbers = metadata.get('report_numbers');
    const numberOfPages = metadata.get('number_of_pages');
    const externalSystemIdentifiers = metadata.get(
      'external_system_identifiers'
    );
    const acceleratorExperiments = metadata.get('accelerator_experiments');
    const abstract = metadata.getIn(['abstracts', 0]);
    const fullTextLinks = metadata.get('fulltext_links');
    const collaborations = metadata.get('collaborations');
    const collaborationsWithSuffix = metadata.get('collaborations_with_suffix');

    const keywords = metadata.get('keywords');
    const authorCount = metadata.get('author_count');

    const canEdit = metadata.get('can_edit', false);

    const figures = metadata.get('figures');

    return (
      <>
        <DocumentHead title={title.get('title')} />
        <Row className="__DetailPage__" type="flex" justify="center">
          <Col xs={24} md={22} lg={21} xxl={18}>
            <Row
              className="mv3"
              type="flex"
              justify="center"
              gutter={{ xs: 0, lg: 16, xl: 32 }}
            >
              <Col xs={24} lg={16}>
                <ContentBox
                  className="md-pb3"
                  loading={loading}
                  leftActions={
                    <Fragment>
                      {fullTextLinks && (
                        <FullTextLinksAction fullTextLinks={fullTextLinks} />
                      )}
                      <CiteModalActionContainer recordId={recordId} />
                      {canEdit && (
                        <EditRecordAction
                          pidType="literature"
                          pidValue={recordId}
                        />
                      )}
                    </Fragment>
                  }
                >
                  <h2>
                    <LiteratureTitle title={title} />
                  </h2>
                  <div>
                    <AuthorsAndCollaborations
                      authorCount={authorCount}
                      authors={authors}
                      enableAuthorsShowAll
                      collaborations={collaborations}
                      collaborationsWithSuffix={collaborationsWithSuffix}
                    />
                  </div>
                  <LiteratureDate date={date} />
                  <div className="mt3">
                    <NumberOfPages numberOfPages={numberOfPages} />
                    <ThesisInfo thesisInfo={thesisInfo} />
                    <PublicationInfoList publicationInfo={publicationInfo} />
                    <ConferenceInfoList conferenceInfo={conferenceInfo} />
                    <IsbnList isbns={isbns} />
                    <ArxivEprintList eprints={eprints} />
                    <DOIList dois={dois} />
                    <ReportNumberList reportNumbers={reportNumbers} />
                    <AcceleratorExperimentList
                      acceleratorExperiments={acceleratorExperiments}
                    />
                    <ExternalSystemIdentifierList
                      externalSystemIdentifiers={externalSystemIdentifiers}
                    />
                  </div>
                </ContentBox>
              </Col>
              <Col xs={24} lg={8}>
                <ContentBox subTitle="Citations">
                  <CitationsByYearGraphContainer />
                </ContentBox>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <RequireOneOf dependencies={[abstract, publicNotes, keywords]}>
                  <ContentBox>
                    <div>
                      <Abstract abstract={abstract} />
                    </div>
                    <div
                      className={classNames({
                        mt3: publicNotes,
                        mb3: keywords,
                      })}
                    >
                      <PublicNotesList publicNotes={publicNotes} />
                    </div>
                    <div>
                      <KeywordList keywords={keywords} />
                    </div>
                  </ContentBox>
                </RequireOneOf>
              </Col>
            </Row>
            <Row>
              <Col className="mt3 mb3" span={24}>
                <Tabs
                  type="card"
                  tabBarStyle={{ marginBottom: 0 }}
                  className="remove-top-border-of-card-children"
                >
                  <Tabs.TabPane
                    tab={
                      <TabNameWithCount
                        name="References"
                        count={referencesCount}
                      />
                    }
                    key="1"
                  >
                    <ReferenceListContainer recordId={recordId} />
                  </Tabs.TabPane>
                  <Tabs.TabPane
                    tab={
                      <TabNameWithCount
                        name="Citations"
                        loading={loadingCitations}
                        count={citationCount}
                      />
                    }
                    key="2"
                    forceRender
                  >
                    <CitationListContainer
                      pidType="literature"
                      recordId={recordId}
                    />
                  </Tabs.TabPane>
                  <Tabs.TabPane
                    tab={
                      <TabNameWithCount
                        name="Figures"
                        count={figures ? figures.size : 0}
                      />
                    }
                    key="3"
                  >
                    <ContentBox>
                      <Figures figures={figures} />
                    </ContentBox>
                  </Tabs.TabPane>
                </Tabs>
              </Col>
            </Row>
          </Col>
        </Row>
      </>
    );
  }
}

DetailPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.objectOf(PropTypes.any).isRequired,
  record: PropTypes.instanceOf(Map).isRequired,
  authors: PropTypes.instanceOf(List).isRequired,
  loading: PropTypes.bool.isRequired,
  citationCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  referencesCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  loadingCitations: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  loading: state.literature.get('loading'),
  record: state.literature.get('data'),
  authors: state.literature.get('authors'),
  citationCount: state.citations.get('total'),
  referencesCount: state.literature.get('totalReferences'),
  loadingCitations: state.citations.get('loading'),
});
const dispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, dispatchToProps)(DetailPage);
