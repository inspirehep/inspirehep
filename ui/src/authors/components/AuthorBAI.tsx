import React from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';
import { getLiteratureSearchUrlForAuthorBAI } from '../../common/utils';

type Props = {
    bai: string;
};

function AuthorBAI({ bai }: Props) {
  return (
    <span>
      Author Identifier:{' '}
      <Link to={getLiteratureSearchUrlForAuthorBAI(bai)}>{bai}</Link>
    </span>
  );
}

export default AuthorBAI;
