import React from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'clas... Remove this comment to see the full error message
import classNames from 'classnames';

import './CollectionLink.scss';
import NewFeatureTag from '../../components/NewFeatureTag';

type Props = {
    to: string;
    active?: boolean;
    newCollection?: boolean;
    children?: React.ReactNode;
};

function CollectionLink({ to, active, children, newCollection }: Props) {
  return (
    <span className="__CollectionLink__ mh4 m-mh2">
      <Link className={classNames('link f5 white', { active })} to={to}>
        {children}
      </Link>
      {newCollection && <NewFeatureTag />}
    </span>
  );
}

export default CollectionLink;
