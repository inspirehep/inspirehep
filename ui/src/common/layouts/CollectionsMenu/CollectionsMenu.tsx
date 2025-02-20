import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Button } from 'antd';
import PropTypes from 'prop-types';

import './CollectionsMenu.less';
import {
  LITERATURE,
  AUTHORS,
  JOBS,
  CONFERENCES,
  INSTITUTIONS,
  SEMINARS,
  EXPERIMENTS,
  JOURNALS,
  DATA,
} from '../../routes';
import { getRootOfLocationPathname } from '../../utils';
import {
  LITERATURE_PID_TYPE,
  AUTHORS_PID_TYPE,
  JOBS_PID_TYPE,
  CONFERENCES_PID_TYPE,
  SEMINARS_PID_TYPE,
  DATA_PID_TYPE,
} from '../../constants';
import CollectionLink from './CollectionLink';
import DropdownMenu from '../../components/DropdownMenu';
import UnclickableTag from '../../components/UnclickableTag';

function CollectionsMenu({ currentPathname }: { currentPathname: string }) {
  const activeCollection = useMemo(
    () => getRootOfLocationPathname(currentPathname),
    [currentPathname]
  );
  const dropdownTitle = 'More...';

  const menuItems = [
    {
      key: '1',
      label: (
        <Link key="1" className="dropdown-link" to={INSTITUTIONS}>
          Institutions
        </Link>
      ),
    },
    {
      key: '2',
      label: (
        <Link key="2" className="dropdown-link" to={EXPERIMENTS}>
          Experiments
        </Link>
      ),
    },
    {
      key: '3',
      label: [
        <Link key="3" className="dropdown-link" to={JOURNALS}>
          Journals
        </Link>,
      ],
    },
  ];

  return (
    <Row
      className="__CollectionsMenu__"
      justify="center"
      data-testid="collections-menu"
    >
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
        <CollectionLink active={activeCollection === DATA_PID_TYPE} to={DATA}>
          Data
        </CollectionLink>
        <UnclickableTag color="processing" className="beta-tag">
          BETA
        </UnclickableTag>
      </Col>
      <Col>
        <DropdownMenu
          overlayClassName="more-collections-menu"
          title={
            <Button
              className="button-no-background ml4"
              onClick={(e) => e.preventDefault()}
            >
              <span className="button-title f5 white"> {dropdownTitle} </span>
            </Button>
          }
          items={menuItems}
        />
      </Col>
    </Row>
  );
}

CollectionsMenu.propTypes = {
  currentPathname: PropTypes.string.isRequired,
};

export default CollectionsMenu;
