import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import moment from 'moment';

import DocumentHead from '../../common/components/DocumentHead';
import { makeCompliantMetaDescription } from '../../common/utils';

const FULL_DATE_FORMAT = 'YYYY/MM/DD';

function LiteratureDocumentHead({ metadata, created }) {
  const title = metadata.getIn(['titles', 0, 'title']);
  const abstract = metadata.getIn(['abstracts', 0, 'value']);

  const onlineDate = moment(created).format(FULL_DATE_FORMAT);

  const arxiv = metadata.getIn(['arxiv_eprints', 0, 'value']);
  const doi = metadata.getIn(['dois', 0, 'value']);
  const citationPdfUrls = metadata.get('citation_pdf_urls');
  const authors = metadata.get('authors');

  const publicationInfo = metadata.getIn(['publication_info', 0], Map());
  const publicationDate = publicationInfo.get('year');
  const journalTitle = publicationInfo.get('journal_title');
  const journalVolume = publicationInfo.get('journal_volume');
  const journalIssue = publicationInfo.get('journal_issue');
  const pageStart = publicationInfo.get('page_start');
  const pageEnd = publicationInfo.get('page_end');
  return (
    // `citation_*` meta tags are used by Google Scholar
    // https://scholar.google.com/intl/en/scholar/inclusion.html#indexing
    <DocumentHead
      title={title}
      description={makeCompliantMetaDescription(abstract)}
    >
      <meta name="citation_title" content={title} />
      <meta name="citation_online_date" content={onlineDate} />

      {abstract && <meta name="citation_abstract" content={abstract} />}

      {publicationDate && (
        <meta name="citation_publication_date" content={publicationDate} />
      )}
      {arxiv && (
        <meta
          name="citation_technical_report_number"
          content={`arXiv:${arxiv}`}
        />
      )}
      {doi && <meta name="citation_doi" content={doi} />}

      {citationPdfUrls &&
        citationPdfUrls.map(link => (
          <meta key={link} name="citation_pdf_url" content={link} />
        ))}

      {authors &&
        authors.map(author => (
          <meta
            key={author.get('full_name')}
            name="citation_author"
            content={author.get('full_name')}
          />
        ))}

      {journalTitle && (
        <meta name="citation_journal_title" content={journalTitle} />
      )}
      {journalVolume && <meta name="citation_volume" content={journalVolume} />}
      {journalIssue && <meta name="citation_issue" content={journalIssue} />}
      {pageStart && <meta name="citation_firstpage" content={pageStart} />}
      {pageEnd && <meta name="citation_lastpage" content={pageEnd} />}
    </DocumentHead>
  );
}

LiteratureDocumentHead.propTypes = {
  metadata: PropTypes.instanceOf(Map).isRequired,
  created: PropTypes.string.isRequired,
};

export default LiteratureDocumentHead;
