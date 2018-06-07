import React from 'react';
import { Layout, Row, Col } from 'antd';

import './Footer.scss';
import InlineList from '../../components/InlineList';

const FOOTER_LINKS = [
  {
    display: 'Privacy Policy',
    href: '//inspirehep.net/info/general/privacy-policy',
  },
  {
    display: 'Terms of Use',
    href: '//inspirehep.net/info/general/terms-of-use',
  },
  {
    display: 'Twitter',
    href: 'https://twitter.com/inspirehep',
  },
  {
    display: 'Blog',
    href: '//blog.inspirehep.net',
  },
];

const Footer = () => (
  <Layout.Footer className="__Footer__">
    <Row type="flex" align="bottom" justify="space-between">
      <Col span={4}>
        <a href="//invenio-software.org/">Powered by Invenio</a>
      </Col>
      <Col>
        <InlineList
          separateItems={false}
          items={FOOTER_LINKS}
          extractKey={link => link.href}
          renderItem={link => (
            <a className="footer-link" href={link.href}>
              {link.display}
            </a>
          )}
        />
      </Col>
    </Row>
  </Layout.Footer>
);

export default Footer;
