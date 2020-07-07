import React from 'react';
import { Row, Col } from 'antd';
import CollaborationLogo from './CollaborationLogo';

import cernLogo from './logos/collab-logo-CERN.png';
import desyLogo from './logos/collab-logo-DESY.png';
import fermilabLogo from './logos/collab-logo-Fermilab.png';
import ihepLogo from './logos/collab-logo-IHEP.png';
import in2p3Logo from './logos/collab-logo-IN2P3.png';
import slacLogo from './logos/collab-logo-SLAC.png';

function CollaborationLogos() {
  return (
    <Row justify="center" align="middle">
      <Col className="ma3">
        <CollaborationLogo
          name="CERN"
          href="https://home.cern"
          src={cernLogo}
        />
      </Col>
      <Col className="ma3">
        <CollaborationLogo name="DESY" href="https://desy.de" src={desyLogo} />
      </Col>
      <Col className="ma3">
        <CollaborationLogo
          name="Fermilab"
          href="https://fnal.gov"
          src={fermilabLogo}
        />
      </Col>
      <Col className="ma3">
        <CollaborationLogo
          name="IHEP"
          href="http://ihep.ac.cn"
          src={ihepLogo}
        />
      </Col>
      <Col className="ma3">
        <CollaborationLogo
          name="IN2P3"
          href="https://in2p3.cnrs.fr"
          src={in2p3Logo}
        />
      </Col>
      <Col className="ma3">
        <CollaborationLogo
          name="SLAC"
          href="https://slac.stanford.edu"
          src={slacLogo}
        />
      </Col>
    </Row>
  );
}

export default CollaborationLogos;
