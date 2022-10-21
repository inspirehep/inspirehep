import React from 'react';

import { AUTHOR_SEMINARS_NS } from '../../search/constants';
import SeminarSearchContainer from '../../seminars/containers/SeminarSearchContainer';
import SeminarCountWarning from '../../seminars/components/SeminarCountWarning';

function AuthorSeminars() {
  return (
    <>
      <SeminarCountWarning />
      <SeminarSearchContainer embedded namespace={AUTHOR_SEMINARS_NS} />
    </>
  );
}

export default AuthorSeminars;
