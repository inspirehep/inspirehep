import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { getLiteratureSearchUrlForAuthorBAI } from '../../common/utils';

function AuthorBAI({ bai }) {
  return (
    <span>
      Author Identifier:{' '}
      <Link to={getLiteratureSearchUrlForAuthorBAI(bai)}>{bai}</Link>
    </span>
  );
}

AuthorBAI.propTypes = {
  bai: PropTypes.string.isRequired,
};

export default AuthorBAI;
