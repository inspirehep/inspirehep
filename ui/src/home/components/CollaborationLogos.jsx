import React from 'react';
import { Row, Col } from 'antd';
import CollaborationLogo from './CollaborationLogo';

const GUTTER = [32, 16];

function CollaborationLogos() {
  return (
    <Row justify="center" align="middle" gutter={GUTTER}>
      <Col>
        <CollaborationLogo name="CERN" href="https://home.cern" />
      </Col>
      <Col>
        <CollaborationLogo name="DESY" href="https://desy.de" />
      </Col>
      <Col>
        <CollaborationLogo name="Fermilab" href="https://fnal.gov" />
      </Col>
      <Col>
        <CollaborationLogo name="IHEP" href="http://ihep.ac.cn" />
      </Col>
      <Col>
        <CollaborationLogo name="IN2P3" href="https://in2p3.cnrs.fr" />
      </Col>
      <Col>
        <CollaborationLogo name="SLAC" href="https://slac.stanford.edu" />
      </Col>
    </Row>
  );
}

export default CollaborationLogos;
