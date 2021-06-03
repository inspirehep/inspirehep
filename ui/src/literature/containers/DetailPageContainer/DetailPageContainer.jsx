import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col, Tabs } from 'antd';
import { Map, List } from 'immutable';
import classNames from 'classnames';
import { FilePdfOutlined, DatabaseOutlined } from '@ant-design/icons';

import './DetailPage.scss';
import {
  fetchLiterature,
  fetchLiteratureAuthors,
  fetchLiteratureReferences,
} from '../../../actions/literature';
import Abstract from '../../components/Abstract';
import ArxivEprintList from '../../components/ArxivEprintList';
import EditRecordAction from '../../../common/components/EditRecordAction.tsx';
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
import TabNameWithCount from '../../../common/components/TabNameWithCount';
import ExperimentList from '../../../common/components/ExperimentList';
import LiteratureTitle from '../../../common/components/LiteratureTitle';
import CiteModalActionContainer from '../CiteModalActionContainer';
import { fetchCitationsByYear } from '../../../actions/citations';
import CitationsByYearGraphContainer from '../../../common/containers/CitationsByYearGraphContainer';
import Figures from '../../components/Figures';
import RequireOneOf from '../../../common/components/RequireOneOf';
import ReferenceListContainer from '../../../common/containers/ReferenceListContainer';
import PublicNotesList from '../../../common/components/PublicNotesList';
import UrlsAction from '../../components/UrlsAction';
import DeletedAlert from '../../../common/components/DeletedAlert';
import SupervisorList from '../../components/SupervisorList';
import withRouteActionsDispatcher from '../../../common/withRouteActionsDispatcher';
import LiteratureDocumentHead from '../../components/LiteratureDocumentHead';
import IncomingLiteratureReferencesLinkAction from '../../../common/components/IncomingLiteratureReferencesLinkAction';
import { getPapersQueryString } from '../../utils';
import ParentRecordInfo from '../../components/ParentRecordInfo';
import BookSeriesInfoList from '../../components/BookSeriesInfoList';
import { LITERATURE_SEMINARS_NS } from '../../../search/constants';
import LiteratureSeminars from '../../components/LiteratureSeminars';
import { newSearch, searchBaseQueriesUpdate } from '../../../actions/search';

function DetailPage({
  authors,
  record,
  referencesCount,
  supervisors,
  seminarsCount,
}) {
  const metadata = record.get('metadata');

  const title = metadata.getIn(['titles', 0]);
  const date = metadata.get('date');
  const controlNumber = metadata.get('control_number');
  const thesisInfo = metadata.get('thesis_info');
  const isbns = metadata.get('isbns');
  const publicationInfo = metadata.get('publication_info');
  const conferenceInfo = metadata.get('conference_info');
  const eprints = metadata.get('arxiv_eprints');
  const publicNotes = metadata.get('public_notes');
  const dois = metadata.get('dois');
  const reportNumbers = metadata.get('report_numbers');
  const numberOfPages = metadata.get('number_of_pages');
  const externalSystemIdentifiers = metadata.get('external_system_identifiers');
  const acceleratorExperiments = metadata.get('accelerator_experiments');
  const abstract = metadata.getIn(['abstracts', 0]);
  const fullTextLinks = metadata.get('fulltext_links');
  const urls = metadata.get('urls');
  const collaborations = metadata.get('collaborations');
  const collaborationsWithSuffix = metadata.get('collaborations_with_suffix');
  const linkedBook = metadata.get('linked_book');
  const bookSeries = metadata.get('book_series');

  const keywords = metadata.get('keywords');
  const authorCount = metadata.get('author_count');
  const citationCount = metadata.get('citation_count');

  const canEdit = metadata.get('can_edit', false);
  const figures = metadata.get('figures');
  const deleted = metadata.get('deleted', false);
  const datasetLinks = metadata.get('dataset_links');

  const publicationInfoWithTitle = publicationInfo
    ? publicationInfo.filter((pub) => pub.get('journal_title'))
    : null;

  return (
    <>
      <LiteratureDocumentHead
        metadata={metadata}
        created={record.get('created')}
      />
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
                leftActions={
                  <>
                    {fullTextLinks && (
                      <UrlsAction
                        urls={fullTextLinks}
                        text="pdf"
                        icon={<FilePdfOutlined />}
                        trackerEventId="PdfDownload"
                      />
                    )}
                    {urls && (
                      <UrlsAction
                        urls={urls}
                        text="links"
                        trackerEventId="LiteratureFileLink"
                      />
                    )}
                    <CiteModalActionContainer recordId={controlNumber} />
                    {canEdit && (
                      <EditRecordAction
                        pidType="literature"
                        pidValue={controlNumber}
                      />
                    )}
                    {datasetLinks && (
                      <UrlsAction
                        urls={datasetLinks}
                        icon={<DatabaseOutlined />}
                        text="datasets"
                      />
                    )}
                  </>
                }
                rightActions={
                  <>
                    {citationCount != null && (
                      <IncomingLiteratureReferencesLinkAction
                        linkQuery={getPapersQueryString(controlNumber)}
                        referenceType="citation"
                        itemCount={citationCount}
                        trackerEventId="Citations:Detail"
                      />
                    )}
                  </>
                }
              >
                <Row>
                  <Col span={24}>{deleted && <DeletedAlert />}</Col>
                </Row>
                <h2>
                  anything
                  <LiteratureTitle title={title}/>
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
                  <SupervisorList supervisors={supervisors} />
                  <ThesisInfo thesisInfo={thesisInfo} />
                  {linkedBook && (
                    <ParentRecordInfo
                      parentRecord={linkedBook}
                      publicationInfo={publicationInfo}
                    />
                  )}
                  {bookSeries && <BookSeriesInfoList bookSeries={bookSeries} />}
                  {publicationInfoWithTitle && (
                    <PublicationInfoList
                      publicationInfo={publicationInfoWithTitle}
                    />
                  )}
                  <ConferenceInfoList conferenceInfo={conferenceInfo} />
                  <IsbnList isbns={isbns} />
                  <ArxivEprintList eprints={eprints} />
                  <DOIList dois={dois} />
                  <ReportNumberList reportNumbers={reportNumbers} />
                  <ExperimentList experiments={acceleratorExperiments} />
                  <ExternalSystemIdentifierList
                    externalSystemIdentifiers={externalSystemIdentifiers}
                  />
                </div>
              </ContentBox>
            </Col>
            <Col xs={24} lg={8}>
              <ContentBox subTitle="Citations per year">
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
            <Col className="mt3" span={24}>
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
                  <ReferenceListContainer recordId={controlNumber} />
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={
                    <TabNameWithCount
                      name="Figures"
                      count={figures ? figures.size : 0}
                    />
                  }
                  key="2"
                >
                  <ContentBox>
                    <Figures figures={figures} />
                  </ContentBox>
                </Tabs.TabPane>
                {seminarsCount > 0 && (
                  <Tabs.TabPane tab={<span>Seminars</span>} key="3">
                    <ContentBox>
                      <LiteratureSeminars />
                    </ContentBox>
                  </Tabs.TabPane>
                )}
              </Tabs>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
}

DetailPage.propTypes = {
  record: PropTypes.instanceOf(Map).isRequired,
  authors: PropTypes.instanceOf(List).isRequired,
  referencesCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  supervisors: PropTypes.instanceOf(List),
};

const mapStateToProps = (state) => ({
  record: state.literature.get('data'),
  authors: state.literature.get('authors'),
  supervisors: state.literature.get('supervisors'),
  referencesCount: state.literature.get('totalReferences'),
  loadingSeminars: state.search.getIn([
    'namespaces',
    LITERATURE_SEMINARS_NS,
    'loading',
  ]),
  seminarsCount: state.search.getIn([
    'namespaces',
    LITERATURE_SEMINARS_NS,
    'initialTotal',
  ]),
});

const DetailPageContainer = connect(mapStateToProps)(DetailPage);

export default withRouteActionsDispatcher(DetailPageContainer, {
  routeParamSelector: ({ id }) => id,
  routeActions: (id) => [
    fetchLiterature(id),
    fetchLiteratureReferences(id),
    fetchLiteratureAuthors(id),
    fetchCitationsByYear({ q: `recid:${id}` }),
    newSearch(LITERATURE_SEMINARS_NS),
    searchBaseQueriesUpdate(LITERATURE_SEMINARS_NS, {
      baseQuery: { q: `literature_records.record.$ref:${id}` },
    }),
  ],
  loadingStateSelector: (state) =>
    !state.literature.hasIn(['data', 'metadata']),
});
