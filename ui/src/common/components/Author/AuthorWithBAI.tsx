import React from 'react';
import { Map } from 'immutable';
import { Link } from 'react-router-dom';
import { Tooltip } from 'antd';

import { getAuthorName, getLiteratureSearchUrlForAuthorBAI } from '../../utils';
import LinkWithTargetBlank from '../LinkWithTargetBlank';
import { SUBMISSIONS_AUTHOR } from '../../routes';

function renderCreateProfileTooltipMessage(author: Map<string, string>) {
  return (
    <>
      <div>The author does not have an INSPIRE profile</div>
      <div>
        <LinkWithTargetBlank href={`${SUBMISSIONS_AUTHOR}?bai=${author.get('bai')}`}>
          Create profile
        </LinkWithTargetBlank>
      </div>
    </>
  );
}

function AuthorWithBAI({ author }: { author: Map<string, string> }) {
  return (
    <Tooltip title={renderCreateProfileTooltipMessage(author)}>
      <Link
        style={{ textDecoration: 'underline dashed' }}
        to={getLiteratureSearchUrlForAuthorBAI(author.get('bai'))}
      >
        {getAuthorName(author)}
      </Link>
    </Tooltip>
  );
}

export default AuthorWithBAI;
