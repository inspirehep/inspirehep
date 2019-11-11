import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

import ArxivEprintList from './ArxivEprintList';
import LiteratureDate from './LiteratureDate';
import AuthorsAndCollaborations from '../../common/components/AuthorsAndCollaborations';
import PublicationInfoList from '../../common/components/PublicationInfoList';
import UrlsAction from './UrlsAction';
import DOILinkAction from './DOILinkAction';
import IconText from '../../common/components/IconText';
import ListItemAction from '../../common/components/ListItemAction';
import EditRecordAction from '../../common/components/EditRecordAction';
import ResultItem from '../../common/components/ResultItem';
import { LITERATURE } from '../../common/routes';
import EventTracker from '../../common/components/EventTracker';
import LiteratureTitle from '../../common/components/LiteratureTitle';
import ResponsiveView from '../../common/components/ResponsiveView';
import CiteModalActionContainer from '../containers/CiteModalActionContainer';
import ConferenceInfoList from './ConferenceInfoList';
import pluralizeUnlessSingle from '../../common/utils';

class LiteratureItem extends Component {
  render() {
    const { metadata, searchRank } = this.props;

    const title = metadata.getIn(['titles', 0]);
    const authors = metadata.get('authors');

    const fullTextLinks = metadata.get('fulltext_links');
    const dois = metadata.get('dois');
    const recordId = metadata.get('control_number');
    const citationCount = metadata.get('citation_count', 0);
    const authorCount = metadata.get('number_of_authors');
    const conferenceInfo = metadata.get('conference_info');

    const date = metadata.get('date');
    const publicationInfo = metadata.get('publication_info');
    const eprints = metadata.get('arxiv_eprints');
    const collaborations = metadata.get('collaborations');
    const collaborationsWithSuffix = metadata.get('collaborations_with_suffix');
    const canEdit = metadata.get('can_edit', false);

    return (
      <ResultItem
        leftActions={
          <Fragment>
            {fullTextLinks && (
              <UrlsAction
                urls={fullTextLinks}
                iconType="download"
                iconText="pdf"
                trackerEventId="PdfDownload"
              />
            )}
            {dois && <DOILinkAction dois={dois} />}
            <CiteModalActionContainer recordId={recordId} />
            {canEdit && (
              <EditRecordAction pidType="literature" pidValue={recordId} />
            )}
          </Fragment>
        }
        rightActions={
          <Fragment>
            {citationCount != null && (
              <ListItemAction>
                <EventTracker eventId="Citations:Search">
                  <Link to={`${LITERATURE}?q=refersto:recid:${recordId}`}>
                    <IconText
                      text={`${citationCount} ${pluralizeUnlessSingle(
                        'citation',
                        citationCount
                      )}`}
                      type="login"
                    />
                  </Link>
                </EventTracker>
              </ListItemAction>
            )}
          </Fragment>
        }
      >
        <div className="flex flex-nowrap">
          <div className="flex-grow-1">
            <Link className="f5" to={`${LITERATURE}/${recordId}`}>
              <LiteratureTitle title={title} />
            </Link>
          </div>
          <ResponsiveView
            min="sm"
            render={() => <div className="light-silver pl2">#{searchRank}</div>}
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
              <LiteratureDate date={date} />
              {')'}
            </>
          )}
        </div>
        <div className="mt1">
          <ul className="bulleted-list">
            {publicationInfo && (
              <li className="dib mr1">
                <PublicationInfoList
                  wrapperClassName="di"
                  publicationInfo={publicationInfo}
                />
              </li>
            )}
            {conferenceInfo && (
              <li className="dib mr1">
                <ConferenceInfoList
                  wrapperClassName="di"
                  conferenceInfo={conferenceInfo}
                />
              </li>
            )}
            {eprints && (
              <li className="dib mr1">
                <ArxivEprintList wrapperClassName="di" eprints={eprints} />
              </li>
            )}
          </ul>
        </div>
      </ResultItem>
    );
  }
}

LiteratureItem.propTypes = {
  metadata: PropTypes.instanceOf(Map).isRequired,
  searchRank: PropTypes.number.isRequired,
};

export default LiteratureItem;
