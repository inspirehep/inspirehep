import React, { useMemo } from 'react';
import { Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './CollectionsMenu.scss';
import {
  LITERATURE,
  AUTHORS,
  JOBS,
  CONFERENCES,
  INSTITUTIONS,
} from '../../routes';
import { getRootOfLocationPathname } from '../../utils';
import {
  LITERATURE_PID_TYPE,
  AUTHORS_PID_TYPE,
  JOBS_PID_TYPE,
  CONFERENCES_PID_TYPE,
  INSTITUTIONS_PID_TYPE,
} from '../../constants';

const COLLECTION_LINK_CLASSNAME = 'collection-link mh4 sm-mh2 f5 white';

function CollectionsMenu({ currentPathname }) {
  const activeCollection = useMemo(
    () => getRootOfLocationPathname(currentPathname),
    [currentPathname]
  );

  return (
    <Row className="__CollectionsMenu__" justify="center">
      <Col>
        <Link
          className={classNames(COLLECTION_LINK_CLASSNAME, {
            active: activeCollection === LITERATURE_PID_TYPE,
          })}
          to={LITERATURE}
        >
          Literature
        </Link>
      </Col>
      <Col>
        <Link
          className={classNames(COLLECTION_LINK_CLASSNAME, {
            active: activeCollection === AUTHORS_PID_TYPE,
          })}
          to={AUTHORS}
        >
          Authors
        </Link>
      </Col>
      <Col>
        <Link
          className={classNames(COLLECTION_LINK_CLASSNAME, {
            active: activeCollection === JOBS_PID_TYPE,
          })}
          to={JOBS}
        >
          Jobs
        </Link>
      </Col>
      <Col>
        <Link
          className={classNames(COLLECTION_LINK_CLASSNAME, {
            active: activeCollection === CONFERENCES_PID_TYPE,
          })}
          to={CONFERENCES}
        >
          Conferences
        </Link>
      </Col>
      <Col>
        <Link
          className={classNames(COLLECTION_LINK_CLASSNAME, {
            active: activeCollection === INSTITUTIONS_PID_TYPE,
          })}
          to={INSTITUTIONS}
        >
          Institutions
        </Link>
      </Col>
    </Row>
  );
}

CollectionsMenu.propTypes = {
  currentPathname: PropTypes.string.isRequired,
};

export default CollectionsMenu;
