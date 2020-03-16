import React from 'react';
import { Row, Col } from 'antd';
import { Link } from 'react-router-dom'

import './CollectionsMenu.scss';
import { LITERATURE, AUTHORS, JOBS, CONFERENCES } from '../../routes';

// eslint-disable-next-line react/prop-types
function CollectionLink({ to, children }) {
  return (
    <Link className="collection-link mh4 f4 white" to={to}>
      {children}
    </Link>
  );
}


function CollectionsMenu() {
  return (
    <Row className="__CollectionsMenu__" justify="center">
      <Col>
        <CollectionLink to={LITERATURE}>Literature</CollectionLink>
      </Col>
      <Col>
        <CollectionLink to={AUTHORS}>Authors</CollectionLink>
      </Col>
      <Col>
        <CollectionLink to={JOBS}>Jobs</CollectionLink>
      </Col>
      <Col>
        <CollectionLink to={CONFERENCES}>Conferences</CollectionLink>
      </Col>
    </Row>
  )
}

export default CollectionsMenu;
