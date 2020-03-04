import React from 'react';
import { Layout, Row, Col } from 'antd';

import './Footer.scss';
import ExternalLink from '../../components/ExternalLink';
import { FEEDBACK_EMAIL } from '../../constants';

const Footer = () => (
  <Layout.Footer className="__Footer__">
    <Row type="flex" align="bottom" justify="space-between">
      <Col>
        <ExternalLink className="footer-link" href="//invenio-software.org/">
          Powered by Invenio
        </ExternalLink>
      </Col>
      <Col>
        <Row type="flex" justify="start">
          <Col>
            <ExternalLink
              className="footer-link"
              href="//labs.inspirehep.net/help/knowledge-base/privacy-policy"
            >
              Privacy Policy
            </ExternalLink>
          </Col>
          <Col>
            <ExternalLink
              className="footer-link"
              href="//labs.inspirehep.net/help/knowledge-base/terms-of-use"
            >
              Terms of Use
            </ExternalLink>
          </Col>
          <Col>
            <ExternalLink
              className="footer-link"
              href={`mailto:${FEEDBACK_EMAIL}`}
            >
              Contact
            </ExternalLink>
          </Col>
          <Col>
            <ExternalLink
              className="footer-link"
              href="https://twitter.com/inspirehep"
            >
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
  </Layout.Footer>
);

export default Footer;
