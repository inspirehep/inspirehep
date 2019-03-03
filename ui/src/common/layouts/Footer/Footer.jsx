import React from 'react';
import { Layout, Row, Col } from 'antd';

import './Footer.scss';
import ExternalLink from '../../components/ExternalLink';


const Footer = () => (
  <Layout.Footer className="__Footer__">
    <Row type="flex" align="bottom" justify="space-between">
      <Col>
        <ExternalLink className="footer-link" href="//invenio-software.org/">Powered by Invenio</ExternalLink>
      </Col>
      <Col>
        <Row type="flex" justify="start">
          <Col>
            <ExternalLink className="footer-link" href="//inspirehep.net/info/general/privacy-policy">
              Privacy Policy
            </ExternalLink>
          </Col>
          <Col>
            <ExternalLink className="footer-link" href="//inspirehep.net/info/general/terms-of-use">
              Terms of Use
            </ExternalLink>
          </Col>
          <Col>
            <ExternalLink className="footer-link" href="mailto:feedback@inspirehep.net">
              Contact
            </ExternalLink>
          </Col>
          <Col>
            <ExternalLink className="footer-link" href="https://twitter.com/inspirehep">
              Twitter
            </ExternalLink>
          </Col>
          <Col>
            <ExternalLink className="footer-link" href="//blog.inspirehep.net">
              Blog
            </ExternalLink>
          </Col>
        </Row>
      </Col>
    </Row>
  </Layout.Footer >
);

export default Footer;
