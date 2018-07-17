import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

import AuthorList from './AuthorList';
import LiteratureDate from './LiteratureDate';
import ArxivEprintList from './ArxivEprintList';
import CollaborationList from './CollaborationList';
import DOIList from './DOIList';
import PartialAbstract from './PartialAbstract/PartialAbstract';
import ReportNumberList from './ReportNumberList';
import PublicationInfoList from './PublicationInfoList';
import ArxivPdfDownloadAction from './ArxivPdfDownloadAction';
import CiteModalAction from './CiteModalAction';
import ListItemAction from '../../common/components/ListItemAction';
import Latex from '../../common/components/Latex';
import ResultItem from '../../common/components/ResultItem';

class LiteratureItem extends Component {
  render() {
    const { metadata } = this.props;

    const title = metadata.getIn(['titles', 0, 'title']);
    const authors = metadata.get('authors');

    const arxivId = metadata.getIn(['arxiv_eprints', 0, 'value']);
    const recordId = metadata.get('control_number');
    const citationCount = metadata.get('citation_count');
    const referenceCount = metadata.get('number_of_references');
    const authorCount = metadata.get('number_of_authors');

    const date = metadata.get('date');
    const publicationInfo = metadata.get('publication_info');
    const eprints = metadata.get('arxiv_eprints');
    const dois = metadata.get('dois');
    const collaborations = metadata.get('collaborations');
    const reportNumbers = metadata.get('report_numbers');
    const abstract = metadata.getIn(['abstracts', 0, 'value']);

    return (
      <ResultItem
        actions={
          <Fragment>
            {arxivId && <ArxivPdfDownloadAction arxivId={arxivId} />}
            <CiteModalAction recordId={recordId} />
            {referenceCount && (
              <ListItemAction
                iconType="login"
                text={`${referenceCount} references`}
                link={{ to: `/literature/${recordId}#references` }}
              />
            )}
            {citationCount && (
              <ListItemAction
                iconType="logout"
                text={`${citationCount} citations`}
                link={{ to: `/literature/${recordId}#citations` }}
              />
            )}
          </Fragment>
        }
      >
        <Link className="f4" to={`/literature/${recordId}`}>
          <Latex>{title}</Latex>
        </Link>
        <div className="mt2">
          <div>
            <CollaborationList collaborations={collaborations} />
            <AuthorList
              authorCount={authorCount}
              recordId={recordId}
              authors={authors}
              limit={collaborations ? 1 : 5}
            />
          </div>
          <LiteratureDate date={date} />
        </div>
        <div className="mt2">
          <PublicationInfoList publicationInfo={publicationInfo} />
          <ArxivEprintList eprints={eprints} />
          <DOIList dois={dois} />
          <ReportNumberList reportNumbers={reportNumbers} />
          <PartialAbstract abstract={abstract} />
        </div>
      </ResultItem>
    );
  }
}

LiteratureItem.propTypes = {
  metadata: PropTypes.instanceOf(Map).isRequired,
};

export default LiteratureItem;
