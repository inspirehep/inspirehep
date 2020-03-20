import React from 'react';
import { Row, Col } from 'antd';
import CollaborationLogo from './CollaborationLogo';

function CollaborationLogos() {
  return (
    <Row justify="center" align="middle">
      <Col className="ma3">
        <CollaborationLogo name="CERN" href="https://home.cern" />
      </Col>
      <Col className="ma3">
        <CollaborationLogo name="DESY" href="https://desy.de" />
      </Col>
      <Col className="ma3">
        <CollaborationLogo name="Fermilab" href="https://fnal.gov" />
      </Col>
      <Col className="ma3">
        <CollaborationLogo name="IHEP" href="http://ihep.ac.cn" />
      </Col>
      <Col className="ma3">
        <CollaborationLogo name="IN2P3" href="https://in2p3.cnrs.fr" />
      </Col>
      <Col className="ma3">
        <CollaborationLogo name="SLAC" href="https://slac.stanford.edu" />
      </Col>
    </Row>
  );
}

export default CollaborationLogos;
