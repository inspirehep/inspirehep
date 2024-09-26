import React, { useMemo } from 'react';

import LiteratureSearchContainer from '../../literature/containers/LiteratureSearchContainer';
import { JOURNAL_PAPERS_NS } from '../../search/constants';

export const JournalPapers = ({ journalName }: { journalName: string }) => {
  const baseQuery = useMemo(
    () => ({
      q: `publication_info.journal_title:"${journalName}"`,
    }),
    [journalName]
  );

  return (
    <LiteratureSearchContainer
      namespace={JOURNAL_PAPERS_NS}
      baseQuery={baseQuery}
      noResultsTitle="0 Journal papers"
      embedded
      page="Journal details"
    />
  );
};

export default JournalPapers;
