import React from 'react';
import ContentBox from '../../../common/components/ContentBox';
import Abstract from '../../../literature/components/Abstract';
import ArxivEprintList from '../../../literature/components/ArxivEprintList';
import DOIList from '../../../literature/components/DOIList';
import AuthorList from '../../../common/components/AuthorList';
import PublicationInfoList from '../../../common/components/PublicationInfoList';
import ReportNumberList from '../../../literature/components/ReportNumberList';
import CollaborationList from '../../../common/components/CollaborationList';
import LiteratureTitle from '../../../common/components/LiteratureTitle';

const LiteratureMainInfo = ({ data }) => {
  const authors = data?.get('authors');
  const title = data?.getIn(['titles', 0]);
  const abstract = data?.getIn(['abstracts', 0]);
  const license = data?.getIn(['license', 0]);
  const arxivEprints = data?.get('arxiv_eprints');
  const dois = data?.get('dois');
  const publicationInfo = data?.get('publication_info');
  const reportNumbers = data?.get('report_numbers');
  const collaborations = data?.get('collaborations');
  const language = data?.getIn(['languages', 0]);
  const titleTranslation = data?.getIn(['title_translations', 0, 'title']);
  const acceleratorExperiment = data?.getIn([
    'accelerator_experiments',
    0,
    'legacy_name',
  ]);

  return (
    <>
      <ContentBox fullHeight={false} className="md-pb3 mb3">
        <h2>
          <LiteratureTitle title={title} />
        </h2>
        {authors && (
          <div className="mb2">
            <AuthorList
              limit={10}
              authors={authors}
              page="literature backofice"
              unlinked
            />
          </div>
        )}
        {publicationInfo && (
          <div className="mb2">
            <PublicationInfoList publicationInfo={publicationInfo} />
          </div>
        )}
        {abstract && (
          <div className="mb2">
            <Abstract abstract={abstract} />
          </div>
        )}
        {license && (
          <div className="mb2">
            License: {license.get('url')}
            <>
              {' '}
              imposed by <strong>{license.get('imposing')}</strong>
            </>
          </div>
        )}
        {arxivEprints && (
          <div className="mb2">
            <ArxivEprintList eprints={arxivEprints} />
          </div>
        )}
        {dois && (
          <div className="mb2">
            <DOIList dois={dois} />
          </div>
        )}
        {reportNumbers && (
          <div className="mb2">
            <ReportNumberList reportNumbers={reportNumbers} />
          </div>
        )}

        {language && <div className="mb2">Language: {language}</div>}
        {titleTranslation && (
          <div className="mb2">Title translation: {titleTranslation}</div>
        )}
        {collaborations && (
          <div className="mb2">
            <CollaborationList collaborations={collaborations} />
          </div>
        )}
        {acceleratorExperiment && (
          <div className="mb2">Experiment: {acceleratorExperiment}</div>
        )}
      </ContentBox>
    </>
  );
};

export default LiteratureMainInfo;
