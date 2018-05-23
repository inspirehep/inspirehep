import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

import ResultItem from '../../common/components/ResultItem';
import AuthorList from './AuthorList';
import LiteratureDate from './LiteratureDate';
import ArxivEprintList from './ArxivEprintList';
import DOIList from './DOIList';
import CollapsableAbstract from './CollapsableAbstract';
import ReportNumberList from './ReportNumberList';
import PublicationInfoList from './PublicationInfoList';
import ArxivPdfDownloadAction from './ArxivPdfDownloadAction';
import CiteModalAction from './CiteModalAction';
import ListItemAction from '../../common/components/ListItemAction';
import Latex from '../../common/components/Latex';

class LiteratureItem extends Component {
  render() {
    const { metadata, display } = this.props;

    const title = metadata.getIn(['titles', 0, 'title']);
    const authors = metadata.get('authors');

    const arxivId = metadata.getIn(['arxiv_eprints', 0, 'value']);
    const recordId = metadata.get('control_number');
    const citationCount = metadata.get('citation_count');
    const referenceCount = display.get('number_of_references');

    const date = display.get('date');
    const publicationInfo = metadata.get('publication_info');
    const eprints = metadata.get('arxiv_eprints');
    const dois = metadata.get('dois');
    const reportNumbers = metadata.get('report_numbers');
    const abstract = metadata.getIn(['abstracts', 0, 'value']);

    return (
      <ResultItem
        title={(
          <Link to={`/literatue/${recordId}`}>
            <Latex>{title}</Latex>
          </Link>
        )}
        description={(
          <div>
            <AuthorList recordId={recordId} authors={authors} />
            <LiteratureDate date={date} />
          </div>
        )}
        actions={[
          arxivId && <ArxivPdfDownloadAction arxivId={arxivId} />,
          <CiteModalAction recordId={recordId} />,
          citationCount && <ListItemAction iconType="logout" text={`${citationCount} citations`} href={`/literature/${recordId}#citations`} />,
          referenceCount && <ListItemAction iconType="login" text={`${referenceCount} references`} href={`/literature/${recordId}#references`} />,
        ].filter(action => action != null)}
      >
        <PublicationInfoList publicationInfo={publicationInfo} />
        <ArxivEprintList eprints={eprints} />
        <DOIList dois={dois} />
        <ReportNumberList reportNumbers={reportNumbers} />
        <CollapsableAbstract abstract={abstract} />
      </ResultItem>
    );
  }
}

LiteratureItem.propTypes = {
  metadata: PropTypes.instanceOf(Map).isRequired,
  display: PropTypes.instanceOf(Map).isRequired,
};


export default LiteratureItem;
