import React, { Fragment, useContext } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { Tooltip } from 'antd';
import {
  FilePdfOutlined,
  FileExclamationTwoTone,
  DatabaseOutlined,
} from '@ant-design/icons';

import ArxivEprintList from './ArxivEprintList';
import LiteratureDate from './LiteratureDate';
import PublicNotesList from '../../common/components/PublicNotesList/PublicNotesList';
import AuthorsAndCollaborations from '../../common/components/AuthorsAndCollaborations';
import PublicationInfoList from '../../common/components/PublicationInfoList';
import BookSeriesInfoList from './BookSeriesInfoList';
import UrlsAction from './UrlsAction';
import DOILinkAction from './DOILinkAction';
import EditRecordAction from '../../common/components/EditRecordAction';
import ResultItem from '../../common/components/ResultItem';
import { LITERATURE_NS } from '../../search/constants';
import { LITERATURE } from '../../common/routes';
import LiteratureTitle from '../../common/components/LiteratureTitle';
import ResponsiveView from '../../common/components/ResponsiveView';
import CiteModalActionContainer from '../containers/CiteModalActionContainer';
import IncomingLiteratureReferencesLinkAction from '../../common/components/IncomingLiteratureReferencesLinkAction';
import ConferenceInfoList from './ConferenceInfoList';
import { getPapersQueryString } from '../utils';
import {
  InlineUL,
  SEPARATOR_MIDDLEDOT,
} from '../../common/components/InlineList';
import AssignAuthorViewContext from '../../authors/AssignViewContext';
import AssignViewOwnProfileContext from '../../authors/assignViewOwnProfileContext';
import AssignViewDifferentProfileContext from '../../authors/assignViewDifferentProfileContext';
import AssignViewNotLoggedInContext from '../../authors/assignViewNotLoggedInContext';
import AssignOneActionContainer from '../../authors/containers/AssignOneActionContainer';
import AssignOneOwnProfileContainer from '../../authors/containers/AssignOneOwnProfileContainer';
import AssignOneDifferentProfileContainer from '../../authors/containers/AssignOneDifferentProfileContainer';
import AssignNoProfileAction from '../../authors/components/AssignNoProfileAction';
import AssignViewNoProfileContext from '../../authors/assignViewNoProfileContext';
import ClaimingDisabledButton from '../../authors/components/ClaimingDisabledButton';
import { FulltextSnippet } from './FulltextSnippet/FulltextSnippet';
import LiteratureClaimButton from './LiteratureClaimButton';
import AssignLiteratureItemDrawerContainer from '../containers/AssignLiteratureItemDrawerContainer';

function LiteratureItem({
  metadata,
  searchRank,
  isCatalogerLoggedIn,
  loggedIn,
  hasAuthorProfile,
  namespace,
}) {
  const title = metadata.getIn(['titles', 0]);
  const authors = metadata.get('authors');

  const fullTextLinks = metadata.get('fulltext_links');
  const urls = metadata.get('urls');
  const dois = metadata.get('dois');
  const recordId = metadata.get('control_number');
  const citationCount = metadata.get('citation_count', 0);
  const authorCount = metadata.get('number_of_authors');
  const conferenceInfo = metadata.get('conference_info');
  const publicNotes = metadata.get('public_notes');
  const fulltextSnippet = metadata.get('fulltext_highlight');

  const date = metadata.get('date');
  const publicationInfo = metadata.get('publication_info');
  const bookSeries = metadata.get('book_series');
  const eprints = metadata.get('arxiv_eprints');
  const collaborations = metadata.get('collaborations');
  const collaborationsWithSuffix = metadata.get('collaborations_with_suffix');
  const canEdit = metadata.get('can_edit', false);
  const datasetLinks = metadata.get('dataset_links');

  const curatedRelation = metadata.get('curated_relation', false);
  const canClaimDifferentProfile = metadata.get('can_claim', false);

  const assignAuthorView = useContext(AssignAuthorViewContext);
  const assignOwnProfileView = useContext(AssignViewOwnProfileContext);
  const assignDifferentProfileView = useContext(
    AssignViewDifferentProfileContext
  );
  const assignNoProfileView = useContext(AssignViewNoProfileContext);
  const assignNoProfileViewCondition =
    assignNoProfileView &&
    !assignOwnProfileView &&
    !assignAuthorView &&
    !assignDifferentProfileView;

  const assignNotLoggedInView = useContext(AssignViewNotLoggedInContext);
  const assignNotLoggedInViewCondition =
    assignNotLoggedInView && !assignNoProfileViewCondition;
  const assignLiteratureViewCondition =
    !assignAuthorView && namespace === LITERATURE_NS;

  const publicationInfoWithTitle = publicationInfo
    ? publicationInfo.filter((pub) => pub.has('journal_title'))
    : null;

  return (
    <ResultItem
      leftActions={
        <Fragment>
          {fullTextLinks && (
            <UrlsAction
              urls={fullTextLinks}
              icon={<FilePdfOutlined />}
              text="pdf"
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
          {dois && <DOILinkAction dois={dois} />}
          <CiteModalActionContainer recordId={recordId} />
          {datasetLinks && (
            <UrlsAction
              urls={datasetLinks}
              icon={<DatabaseOutlined />}
              text="datasets"
            />
          )}
          {canEdit && (
            <EditRecordAction pidType="literature" pidValue={recordId} />
          )}
          {assignAuthorView && <AssignOneActionContainer recordId={recordId} />}
          {assignOwnProfileView && !assignAuthorView && (
            <AssignOneOwnProfileContainer
              recordId={recordId}
              disabledAssignAction={curatedRelation}
            />
          )}
          {assignDifferentProfileView && !assignOwnProfileView && (
            <AssignOneDifferentProfileContainer
              recordId={recordId}
              claimingClaimedPapersDisabled={!curatedRelation}
              claimingUnclaimedPapersDisabled={curatedRelation}
              userCanNotClaimProfile={!canClaimDifferentProfile}
            />
          )}
          {assignNoProfileViewCondition && <AssignNoProfileAction />}
          {assignNotLoggedInViewCondition && <ClaimingDisabledButton />}
          {assignLiteratureViewCondition && (
            <LiteratureClaimButton
              loggedIn={loggedIn}
              hasAuthorProfile={hasAuthorProfile}
              authors={authors}
              controlNumber={recordId}
            />
          )}
        </Fragment>
      }
      rightActions={
        <Fragment>
          {citationCount != null && (
            <IncomingLiteratureReferencesLinkAction
              linkQuery={getPapersQueryString(recordId)}
              referenceType="citation"
              itemCount={citationCount}
              trackerEventId="Citations:Search"
            />
          )}
        </Fragment>
      }
    >
      <div data-test-id="literature-result-item">
        <div className="flex flex-nowrap">
          <div className="flex-grow-1">
            <Link
              data-test-id="literature-result-title-link"
              className="result-item-title"
              to={`${LITERATURE}/${recordId}`}
            >
              <LiteratureTitle title={title} />
              {(assignAuthorView || assignOwnProfileView) && !curatedRelation && (
                <Tooltip title="Unclaimed paper. Click on the Claim button to claim or remove it from the profile">
                  <FileExclamationTwoTone className="ml1" />
                </Tooltip>
              )}
            </Link>
          </div>
          <ResponsiveView
            min="sm"
            render={() => (
              <div
                data-test-id="literature-result-rank"
                className="light-silver pl2"
              >
                #{searchRank}
              </div>
            )}
          />
        </div>
        <div className="mt1">
          <AuthorsAndCollaborations
            authorCount={authorCount}
            authors={authors}
            collaborations={collaborations}
            collaborationsWithSuffix={collaborationsWithSuffix}
          />
          {date && (
            <>
              {' ('}
              <LiteratureDate date={date} />)
            </>
          )}
        </div>
        <div className="mt1">
          <InlineUL separator={SEPARATOR_MIDDLEDOT}>
            {bookSeries && <BookSeriesInfoList bookSeries={bookSeries} />}
            {publicationInfoWithTitle && publicationInfoWithTitle.size > 0 && (
              <PublicationInfoList publicationInfo={publicationInfoWithTitle} />
            )}
            {conferenceInfo && (
              <ConferenceInfoList conferenceInfo={conferenceInfo} />
            )}
            {eprints && <ArxivEprintList eprints={eprints} />}
          </InlineUL>
        </div>
        {isCatalogerLoggedIn && (
          <div className="mt1">
            <InlineUL separator={SEPARATOR_MIDDLEDOT}>
              <PublicNotesList publicNotes={publicNotes} />
            </InlineUL>
          </div>
        )}
      </div>
      {fulltextSnippet && (
        <div className="mt1">
          <FulltextSnippet snippet={fulltextSnippet.valueSeq().first()} />
        </div>
      )}
      {authors && (
        <AssignLiteratureItemDrawerContainer
          authors={authors}
          itemLiteratureId={recordId}
        />
      )}
    </ResultItem>
  );
}

LiteratureItem.propTypes = {
  metadata: PropTypes.instanceOf(Map).isRequired,
  searchRank: PropTypes.number.isRequired,
  isCatalogerLoggedIn: PropTypes.bool,
};

export default LiteratureItem;
