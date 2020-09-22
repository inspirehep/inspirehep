import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Menu, Button } from 'antd';
import PropTypes from 'prop-types';

import './CollectionsMenu.scss';
import {
  LITERATURE,
  AUTHORS,
  JOBS,
  CONFERENCES,
  INSTITUTIONS,
  SEMINARS,
  EXPERIMENTS,
} from '../../routes';
import { getRootOfLocationPathname } from '../../utils';
import {
  LITERATURE_PID_TYPE,
  AUTHORS_PID_TYPE,
  JOBS_PID_TYPE,
  CONFERENCES_PID_TYPE,
  SEMINARS_PID_TYPE,
} from '../../constants';
import CollectionLink from './CollectionLink';
import DropdownMenu from '../../components/DropdownMenu';

function CollectionsMenu({ currentPathname }) {
  const activeCollection = useMemo(
    () => getRootOfLocationPathname(currentPathname),
    [currentPathname]
  );
  const dropdownTitle = 'More...';

  return (
    <Row className="__CollectionsMenu__" justify="center">
      <Col>
        <CollectionLink
          active={activeCollection === LITERATURE_PID_TYPE}
          to={`${LITERATURE}`}
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
        <DropdownMenu
          overlayClassName="more-collections-menu"
          className="dropdown mh4 m-mh2"
          title={
            <Button
              className="button-no-background ml4"
              onClick={e => e.preventDefault()}
            >
              <span className="button-title f5 white"> {dropdownTitle} </span>
            </Button>
          }
        >
          <Menu.Item className="dropdown-menu-item" key="more.institutions">
            <Link className="dropdown-link" to={INSTITUTIONS}>
              Institutions
            </Link>
          </Menu.Item>
          <Menu.Item className="dropdown-menu-item" key="more.experiments">
            <Link className="dropdown-link" to={EXPERIMENTS}>
              Experiments
            </Link>
          </Menu.Item>
        </DropdownMenu>
      </Col>
    </Row>
  );
}

CollectionsMenu.propTypes = {
  currentPathname: PropTypes.string.isRequired,
};

export default CollectionsMenu;
