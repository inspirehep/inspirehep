import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

import './CollectionLink.scss';
import NewFeatureTag from '../../components/NewFeatureTag';

function CollectionLink({ to, active, children, newCollection }) {
  return (
    <span className="__CollectionLink__ mh4 m-mh2">
      <Link className={classNames('link f5 white', { active })} to={to}>
        {children}
      </Link>
      {newCollection && <NewFeatureTag />}
    </span>
  );
}

CollectionLink.propTypes = {
  to: PropTypes.string.isRequired,
  active: PropTypes.bool,
  newCollection: PropTypes.bool,
  children: PropTypes.node,
};

export default CollectionLink;
