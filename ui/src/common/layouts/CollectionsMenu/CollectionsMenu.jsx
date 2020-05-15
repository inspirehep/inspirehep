import React, { useMemo } from 'react';
import { Row, Col } from 'antd';
import PropTypes from 'prop-types';

import './CollectionsMenu.scss';
import {
  LITERATURE,
  AUTHORS,
  JOBS,
  CONFERENCES,
  INSTITUTIONS,
  SEMINARS,
} from '../../routes';
import { getRootOfLocationPathname } from '../../utils';
import {
  LITERATURE_PID_TYPE,
  AUTHORS_PID_TYPE,
  JOBS_PID_TYPE,
  CONFERENCES_PID_TYPE,
  INSTITUTIONS_PID_TYPE,
  SEMINARS_PID_TYPE,
} from '../../constants';
import CollectionLink from './CollectionLink';

function CollectionsMenu({ currentPathname }) {
  const activeCollection = useMemo(
    () => getRootOfLocationPathname(currentPathname),
    [currentPathname]
  );

  return (
    <Row className="__CollectionsMenu__" justify="center">
      <Col>
        <CollectionLink
          active={activeCollection === LITERATURE_PID_TYPE}
          to={LITERATURE}
        >
          Literature
        </CollectionLink>
      </Col>
      <Col>
        <CollectionLink
          active={activeCollection === AUTHORS_PID_TYPE}
          to={AUTHORS}
        >
          Authors
        </CollectionLink>
      </Col>
      <Col>
        <CollectionLink active={activeCollection === JOBS_PID_TYPE} to={JOBS}>
          Jobs
        </CollectionLink>
      </Col>
      <Col>
        <CollectionLink
          active={activeCollection === SEMINARS_PID_TYPE}
          to={SEMINARS}
          newCollection
        >
          Seminars
        </CollectionLink>
      </Col>
      <Col>
        <CollectionLink
          active={activeCollection === CONFERENCES_PID_TYPE}
          to={CONFERENCES}
        >
          Conferences
        </CollectionLink>
      </Col>
      <Col>
        <CollectionLink
          active={activeCollection === INSTITUTIONS_PID_TYPE}
          to={INSTITUTIONS}
        >
          Institutions
        </CollectionLink>
      </Col>
    </Row>
  );
}

CollectionsMenu.propTypes = {
  currentPathname: PropTypes.string.isRequired,
};

export default CollectionsMenu;
