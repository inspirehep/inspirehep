import React from 'react';

import { LITERATURE_SEMINARS_NS } from '../../search/constants';
import { LOCAL_TIMEZONE } from '../../common/constants';
import SeminarItem from '../../seminars/components/SeminarItem';
import ResultsContainer from '../../common/containers/ResultsContainer';
import PaginationContainer from '../../common/containers/PaginationContainer';
import SeminarCountWarning from '../../seminars/components/SeminarCountWarning';

function renderSeminarItem(result) {
  return (
    <SeminarItem
      metadata={result.get('metadata')}
      selectedTimezone={LOCAL_TIMEZONE}
      enableActions={false}
    />
  );
}

function LiteratureSeminars() {
  return (
    <>
      <SeminarCountWarning />
      <ResultsContainer
        namespace={LITERATURE_SEMINARS_NS}
        renderItem={renderSeminarItem}
      />
      <PaginationContainer namespace={LITERATURE_SEMINARS_NS} />
    </>
  );
}

export default LiteratureSeminars;
