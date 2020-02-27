import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { Link } from 'react-router-dom';
import { Tooltip } from 'antd';

import { getAuthorName, getLiteratureSearchUrlForAuthorBAI } from '../../utils';
import ExternalLink from '../ExternalLink';
import { SUBMISSIONS_AUTHOR } from '../../routes';

function renderCreateProfileTooltipMessage(author) {
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

function AuthorWithBAI({ author }) {
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
  author: PropTypes.instanceOf(Map).isRequired,
};

export default AuthorWithBAI;
