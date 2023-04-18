import React from 'react';
import { connect, RootStateOrAny } from 'react-redux';
import { Row, Col, Tabs } from 'antd';
import { Map, List } from 'immutable';
import classNames from 'classnames';
import { FilePdfOutlined, DatabaseOutlined } from '@ant-design/icons';

import './DetailPage.less';
import {
  fetchLiterature,
  fetchLiteratureAuthors,
  fetchLiteratureReferences,
} from '../../../actions/literature';
import Abstract from '../../components/Abstract';
import ArxivEprintList from '../../components/ArxivEprintList';
import EditRecordAction from '../../../common/components/EditRecordAction';
import DOIList from '../../components/DOIList';
import { PDGKeywords } from '../../components/PDGKeywords';
import KeywordList from '../../../common/components/KeywordList';
import AuthorsAndCollaborations from '../../../common/components/AuthorsAndCollaborations';
import ExternalSystemIdentifierList from '../../components/ExternalSystemIdentifierList';
import ContentBox from '../../../common/components/ContentBox';
import LiteratureDate from '../../components/LiteratureDate';
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
import ReferenceSearchLinkAction from '../../../common/components/ReferenceSearchLinkAction';
import { getPapersQueryString } from '../../utils';
import ParentRecordInfo from '../../components/ParentRecordInfo';
import BookSeriesInfoList from '../../components/BookSeriesInfoList';
import { LITERATURE_SEMINARS_NS } from '../../../search/constants';
import LiteratureSeminars from '../../components/LiteratureSeminars';
import { newSearch, searchBaseQueriesUpdate } from '../../../actions/search';
import ImprintInfo from '../../components/ImprintInfo';
import HiddenCollectionAlert from '../../components/LiteratureCollectionBanner';
import AssignLiteratureItemDrawerContainer from '../AssignLiteratureItemDrawerContainer';
import LiteratureClaimButton from '../../components/LiteratureClaimButton';
import PersistentIdentifiers from '../../components/PersistentIdentifiers';
import { APIButton } from '../../../common/components/APIButton';
import { isSuperUser } from '../../../common/authorization';

function DetailPage({
  authors,
  record,
  referencesCount,
  supervisors,
  seminarsCount,
  loggedIn,
  hasAuthorProfile,
  isSuperUserLoggedIn,
}: {
  authors: List<any>;
  record: Map<string, any>;
  referencesCount: string | number;
  supervisors: List<any>;
  seminarsCount: number;
  loggedIn: boolean;
  hasAuthorProfile: boolean;
  isSuperUserLoggedIn: boolean;
}) {
  const metadata = record.get('metadata');

  const title = metadata.getIn(['titles', 0]);
  const date = metadata.get('date');
  const controlNumber = metadata.get('control_number') as number;
  const thesisInfo = metadata.get('thesis_info');
  const isbns = metadata.get('isbns');
  const imprint = metadata.get('imprints');
  const publicationInfo = metadata.get('publication_info');
  const conferenceInfo = metadata.get('conference_info');
  const documentType = metadata.get('document_type');
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
  const PDGkeywords = metadata.get('pdg_keywords');
  const authorCount = metadata.get('author_count');
  const citationCount = metadata.get('citation_count');
  const persistentIdentifiers = metadata.get('persistent_identifiers');

  const canEdit = metadata.get('can_edit', false);
  const figures = metadata.get('figures');
  const deleted = metadata.get('deleted', false);
  const datasetLinks = metadata.get('dataset_links');

  const publicationInfoWithTitle = publicationInfo
    ? publicationInfo.filter((pub: Map<string, any>) =>
        pub.has('journal_title')
      )
    : null;

  let tabItems = [
    {
      label: (
        <TabNameWithCount
          name="References"
          count={referencesCount}
          page="Literature detail"
        />
      ),
      key: '1',
      children: <ReferenceListContainer recordId={controlNumber} />,
    },
    {
      label: (
        <TabNameWithCount
          name="Figures"
          count={figures ? figures.size : 0}
          page="Literature detail"
        />
      ),
      key: '2',
      children: (
        <ContentBox>
          <Figures figures={figures} />
        </ContentBox>
      ),
    },
  ];

  if (seminarsCount > 0) {
    tabItems = [
      ...tabItems,
      {
        label: <span>Seminars</span>,
        key: '3',
        children: (
          <ContentBox>
            <LiteratureSeminars />
          </ContentBox>
        ),
      },
    ];
  }

  return (
    <>
      {authors && (
        <AssignLiteratureItemDrawerContainer
          itemLiteratureId={controlNumber}
          page="Literature detail"
        />
      )}
      <LiteratureDocumentHead
        metadata={metadata}
        created={record.get('created')}
      />
      <Row className="__DetailPage__" justify="center">
        <Col xs={24} md={22} lg={21} xxl={18}>
          <Row className="mv3" justify="center">
            <Col span={24}>{hiddenCollection && <HiddenCollectionAlert />}</Col>
          </Row>
          <Row
            className="mv3"
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
                        trackerEventId="Pdf download"
                        eventAction="Download"
                        page="Literature detail"
                      />
                    )}
                    {urls && (
                      <UrlsAction
                        urls={urls}
                        text="links"
                        trackerEventId="Literature file"
                        page="Literature detail"
                      />
                    )}
                    <CiteModalActionContainer
                      // @ts-ignore
                      recordId={controlNumber}
                      // @ts-ignore
                      page="Literature detail"
                    />
                    <LiteratureClaimButton
                      loggedIn={loggedIn}
                      hasAuthorProfile={hasAuthorProfile}
                      authors={authors}
                      controlNumber={controlNumber}
                      page="Literature detail"
                    />
                    {canEdit && (
                      <EditRecordAction
                        pidType="literature"
                        pidValue={controlNumber}
                        page="Literature detail"
                      />
                    )}
                    {datasetLinks && (
                      <UrlsAction
                        urls={datasetLinks}
                        icon={<DatabaseOutlined />}
                        text="datasets"
                        trackerEventId="Dataset links"
                        page="Literature detail"
                      />
                    )}
                    {isSuperUserLoggedIn && (
                      <APIButton url={window.location.href} />
                    )}
                  </>
                }
                rightActions={
                  <>
                    <ReferenceSearchLinkAction
                      recordId={controlNumber}
                      page="Literature detail"
                    />
                    {citationCount != null && (
                      <IncomingLiteratureReferencesLinkAction
                        linkQuery={getPapersQueryString(controlNumber)}
                        referenceType="citation"
                        itemCount={citationCount}
                        trackerEventId="Citations link"
                        eventCategory="Literature detail"
                      />
                    )}
                  </>
                }
              >
                <Row>
                  <Col span={24}>{deleted && <DeletedAlert />}</Col>
                </Row>
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
                    page="Literature detail"
                  />
                </div>
                <LiteratureDate date={date} />
                <div className="mt3">
                  <NumberOfPages numberOfPages={numberOfPages} />
                  <SupervisorList
                    supervisors={supervisors}
                    page="Literature detail"
                  />
                  <ThesisInfo thesisInfo={thesisInfo} />
                  {linkedBook && (
                    <ParentRecordInfo
                      parentRecord={linkedBook}
                      publicationInfo={publicationInfo}
                    />
                  )}
                  {bookSeries && <BookSeriesInfoList bookSeries={bookSeries} />}
                  {publicationInfoWithTitle &&
                    publicationInfoWithTitle.size > 0 && (
                      <PublicationInfoList
                        publicationInfo={publicationInfoWithTitle}
                      />
                    )}
                  <ConferenceInfoList
                    conferenceInfo={conferenceInfo}
                    isProceedings={
                      documentType &&
                      documentType.toJS().includes('proceedings')
                    }
                  />
                  <IsbnList isbns={isbns} />
                  <ImprintInfo imprint={imprint} />
                  <ArxivEprintList page="Literature detail" eprints={eprints} />
                  <DOIList dois={dois} />
                  {persistentIdentifiers && persistentIdentifiers.size > 0 && (
                    <PersistentIdentifiers
                      identifiers={persistentIdentifiers}
                    />
                  )}
                  {PDGkeywords && PDGkeywords.size > 0 && (
                    <PDGKeywords keywords={PDGkeywords} />
                  )}
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
                items={tabItems}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
}

const mapStateToProps = (state: RootStateOrAny) => ({
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
  loggedIn: state.user.get('loggedIn'),
  hasAuthorProfile:
    state.user.getIn(['data', 'profile_control_number']) !== null,
  isSuperUserLoggedIn: isSuperUser(state.user.getIn(['data', 'roles'])),
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
