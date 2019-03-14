import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

import ArxivEprintList from './ArxivEprintList';
import LiteratureDate from './LiteratureDate';
import AuthorsAndCollaborations from '../../common/components/AuthorsAndCollaborations';
import PublicationInfoList from '../../common/components/PublicationInfoList';
import ArxivPdfDownloadAction from './ArxivPdfDownloadAction';
import DOILinkAction from './DOILinkAction';
import CiteModalAction from './CiteModalAction';
import ListItemAction from '../../common/components/ListItemAction';
import EditRecordActionContainer from '../../common/containers/EditRecordActionContainer';
import ResultItem from '../../common/components/ResultItem';
import { LITERATURE } from '../../common/routes';
import EventTracker from '../../common/components/EventTracker';
import LiteratureTitle from '../../common/components/LiteratureTitle';

class LiteratureItem extends Component {
  renderBulletIfPublicationInfoAndEprintsNotEmpty() {
    const { metadata } = this.props;
    const eprints = metadata.get('arxiv_eprints');
    const publicationInfo = metadata.get('publication_info');
    return publicationInfo && eprints && <span> &bull; </span>;
  }

  render() {
    const { metadata } = this.props;

    const title = metadata.getIn(['titles', 0]);
    const authors = metadata.get('authors');

    const arxivId = metadata.getIn(['arxiv_eprints', 0, 'value']);
    const doi = metadata.getIn(['dois', 0, 'value']);
    const recordId = metadata.get('control_number');
    const citationCount = metadata.get('citation_count', 0);
    const authorCount = metadata.get('number_of_authors');

    const date = metadata.get('date');
    const publicationInfo = metadata.get('publication_info');
    const eprints = metadata.get('arxiv_eprints');
    const collaborations = metadata.get('collaborations');
    const collaborationsWithSuffix = metadata.get('collaborations_with_suffix');

    return (
      <ResultItem
        leftActions={
          <Fragment>
            {arxivId && <ArxivPdfDownloadAction arxivId={arxivId} />}
            {doi && <DOILinkAction doi={doi} />}
            <CiteModalAction recordId={recordId} />
            <EditRecordActionContainer recordId={recordId} />
          </Fragment>
        }
        rightActions={
          <Fragment>
            {citationCount != null && (
              <EventTracker eventId="Citations:Search">
                <ListItemAction
                  iconType="login"
                  text={`${citationCount} citations`}
                  link={{ to: `${LITERATURE}?q=refersto:recid:${recordId}` }}
                />
              </EventTracker>
            )}
          </Fragment>
        }
      >
        <Link className="f5" to={`${LITERATURE}/${recordId}`}>
          <LiteratureTitle title={title} />
        </Link>
        <div className="mt1">
          <AuthorsAndCollaborations
            authorCount={authorCount}
            authors={authors}
            collaborations={collaborations}
            collaborationsWithSuffix={collaborationsWithSuffix}
          />
          {' ('}
          <LiteratureDate date={date} />
          {')'}
        </div>
        <div className="mt1">
          <PublicationInfoList
            wrapperClassName="di"
            publicationInfo={publicationInfo}
          />
          {this.renderBulletIfPublicationInfoAndEprintsNotEmpty()}
          <ArxivEprintList wrapperClassName="di" eprints={eprints} />
        </div>
      </ResultItem>
    );
  }
}

LiteratureItem.propTypes = {
  metadata: PropTypes.instanceOf(Map).isRequired,
};

export default LiteratureItem;
