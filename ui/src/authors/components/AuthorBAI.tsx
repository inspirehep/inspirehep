import React from 'react';
import { Link } from 'react-router-dom';

import { getLiteratureSearchUrlForAuthorBAI } from '../../common/utils';

function AuthorBAI({ bai }: { bai: string }) {
  return (
    <span>
      Author Identifier:{' '}
      <Link to={getLiteratureSearchUrlForAuthorBAI(bai)}>{bai}</Link>
    </span>
  );
}

export default AuthorBAI;
