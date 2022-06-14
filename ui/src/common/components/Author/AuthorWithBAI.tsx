import React from 'react';
import { Map } from 'immutable';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';
import { Tooltip } from 'antd';

import { getAuthorName, getLiteratureSearchUrlForAuthorBAI } from '../../utils';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../ExternalLink.tsx';
import { SUBMISSIONS_AUTHOR } from '../../routes';

function renderCreateProfileTooltipMessage(author: $TSFixMe) {
  return (
    <>
      <div>The author does not have an INSPIRE profile</div>
      <div>
        <ExternalLink href={`${SUBMISSIONS_AUTHOR}?bai=${author.get('bai')}`}>
          Create profile
        </ExternalLink>
      </div>
    </>
  );
}

type Props = {
    author: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
};

function AuthorWithBAI({ author }: Props) {
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
