import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';
import { Tooltip } from 'antd';

import { getAuthorName, getLiteratureSearchUrlForAuthorBAI } from '../../utils';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../ExternalLink.tsx';
import { SUBMISSIONS_AUTHOR } from '../../routes';

function renderCreateProfileTooltipMessage(author: any) {
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

function AuthorWithBAI({
  author
}: any) {
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

AuthorWithBAI.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  author: PropTypes.instanceOf(Map).isRequired,
};

export default AuthorWithBAI;
