import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col, Tabs } from 'antd';
import { Map, List } from 'immutable';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'clas... Remove this comment to see the full error message
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
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
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
import ImprintInfo from '../../components/ImprintInfo';
import HiddenCollectionAlert from '../../components/LiteratureCollectionBanner';

function DetailPage({
  authors,
  record,
  referencesCount,
  supervisors,
  seminarsCount
}: any) {
  const metadata = record.get('metadata');

  const title = metadata.getIn(['titles', 0]);
  const date = metadata.get('date');
  const controlNumber = metadata.get('control_number');
  const thesisInfo = metadata.get('thesis_info');
  const isbns = metadata.get('isbns');
  const imprint = metadata.get('imprints');
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
  const hiddenCollection = metadata.get('is_collection_hidden');
  const keywords = metadata.get('keywords');
  const authorCount = metadata.get('author_count');
  const citationCount = metadata.get('citation_count');

  const canEdit = metadata.get('can_edit', false);
  const figures = metadata.get('figures');
  const deleted = metadata.get('deleted', false);
  const datasetLinks = metadata.get('dataset_links');

  const publicationInfoWithTitle = publicationInfo
    ? publicationInfo.filter((pub: any) => pub.has('journal_title'))
    : null;

  return (
    <>
      <LiteratureDocumentHead
        metadata={metadata}
        created={record.get('created')}
      />
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <Row className="__DetailPage__" type="flex" justify="center">
        <Col xs={24} md={22} lg={21} xxl={18}>
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          <Row className="mv3" type="flex" justify="center">
            <Col span={24}>{hiddenCollection && <HiddenCollectionAlert />}</Col>
          </Row>
          <Row
            className="mv3"
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            type="flex"
            justify="center"
            gutter={{ xs: 0, lg: 16, xl: 32 }}
          >
            <Col xs={24} lg={16}>
              <ContentBox
                // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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
                  // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                  <LiteratureTitle title={title} />
                </h2>
                <div>
                  <AuthorsAndCollaborations
                    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                    authorCount={authorCount}
                    authors={authors}
                    enableAuthorsShowAll
                    collaborations={collaborations}
                    collaborationsWithSuffix={collaborationsWithSuffix}
                  />
                </div>
                // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                <LiteratureDate date={date} />
                <div className="mt3">
                  // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                  <NumberOfPages numberOfPages={numberOfPages} />
                  <SupervisorList supervisors={supervisors} />
                  // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                  <ThesisInfo thesisInfo={thesisInfo} />
                  {linkedBook && (
                    <ParentRecordInfo
                      parentRecord={linkedBook}
                      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ parentRecord: any; publicationInfo: any; }... Remove this comment to see the full error message
                      publicationInfo={publicationInfo}
                    />
                  )}
                  {bookSeries && <BookSeriesInfoList bookSeries={bookSeries} />}
                  {publicationInfoWithTitle &&
                    publicationInfoWithTitle.size > 0 && (
                      <PublicationInfoList
                        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                        publicationInfo={publicationInfoWithTitle}
                      />
                    )}
                  // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                  <ConferenceInfoList conferenceInfo={conferenceInfo} />
                  // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                  <IsbnList isbns={isbns} />
                  // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                  <ImprintInfo imprint={imprint} />
                  // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                  <ArxivEprintList eprints={eprints} />
                  // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                  <DOIList dois={dois} />
                  // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                  <ReportNumberList reportNumbers={reportNumbers} />
                  // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                  <ExperimentList experiments={acceleratorExperiments} />
                  <ExternalSystemIdentifierList
                    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                    externalSystemIdentifiers={externalSystemIdentifiers}
                  />
                </div>
              </ContentBox>
            </Col>
            <Col xs={24} lg={8}>
              // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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
                    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                    <Abstract abstract={abstract} />
                  </div>
                  <div
                    className={classNames({
                      mt3: publicNotes,
                      mb3: keywords,
                    })}
                  >
                    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                    <PublicNotesList publicNotes={publicNotes} />
                  </div>
                  <div>
                    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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
                      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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
                      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  record: PropTypes.instanceOf(Map).isRequired,
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  authors: PropTypes.instanceOf(List).isRequired,
  referencesCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  supervisors: PropTypes.instanceOf(List),
};

const mapStateToProps = (state: any) => ({
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
  ])
});

const DetailPageContainer = connect(mapStateToProps)(DetailPage);

export default withRouteActionsDispatcher(DetailPageContainer, {
  routeParamSelector: ({
    id
  }: any) => id,
  routeActions: (id: any) => [
    fetchLiterature(id),
    fetchLiteratureReferences(id),
    fetchLiteratureAuthors(id),
    fetchCitationsByYear({ q: `recid:${id}` }),
    newSearch(LITERATURE_SEMINARS_NS),
    searchBaseQueriesUpdate(LITERATURE_SEMINARS_NS, {
      baseQuery: { q: `literature_records.record.$ref:${id}` },
    }),
  ],
  loadingStateSelector: (state: any) => !state.literature.hasIn(['data', 'metadata']),
});
