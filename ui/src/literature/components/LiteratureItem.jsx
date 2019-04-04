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
import IconText from '../../common/components/IconText';
import ListItemAction from '../../common/components/ListItemAction';
import EditRecordActionContainer from '../../common/containers/EditRecordActionContainer';
import ResultItem from '../../common/components/ResultItem';
import { LITERATURE } from '../../common/routes';
import EventTracker from '../../common/components/EventTracker';
import LiteratureTitle from '../../common/components/LiteratureTitle';
import ResponsiveView from '../../common/components/ResponsiveView';

class LiteratureItem extends Component {
  renderBulletIfPublicationInfoAndEprintsNotEmpty() {
    const { metadata } = this.props;
    const eprints = metadata.get('arxiv_eprints');
    const publicationInfo = metadata.get('publication_info');
    return publicationInfo && eprints && <span> &bull; </span>;
  }

  render() {
    const { metadata, searchRank } = this.props;

    const title = metadata.getIn(['titles', 0]);
    const authors = metadata.get('authors');

    const arxivId = metadata.getIn(['arxiv_eprints', 0, 'value']);
    const dois = metadata.get('dois');
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
            {dois && <DOILinkAction dois={dois} />}
            <CiteModalAction recordId={recordId} />
            <EditRecordActionContainer recordId={recordId} />
          </Fragment>
        }
        rightActions={
          <Fragment>
            {citationCount != null && (
              <ListItemAction>
                <EventTracker eventId="Citations:Search">
                  <Link to={`${LITERATURE}?q=refersto:recid:${recordId}`}>
                    <IconText
                      text={`${citationCount} citations`}
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
  searchRank: PropTypes.number.isRequired,
};

export default LiteratureItem;
