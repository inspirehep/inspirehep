import React from 'react';
import RcFooter from 'rc-footer';
import 'rc-footer/assets/index.css';
import { Row, Col } from 'antd';

import './Footer.scss';
import {
  FEEDBACK_EMAIL,
  INSPIRE_TWITTER_ACCOUNT,
  ABOUT_INSPIRE_URL,
  CONTENT_POLICY_URL,
  PRIVACY_POLICY_URL,
  TERMS_OF_USE_URL,
  FAQ_URL,
  HELP_BLOG_URL,
  BLOG_URL,
  HOLDINGPEN_URL,
  AUTHORLIST_TOOL_URL,
  INVENIO_URL,
} from '../../constants';
import ExternalLink from '../../components/ExternalLink';

const COLUMNS = [
  {
    title: 'INSPIRE',
    items: [
      {
        title: 'About INSPIRE',
        url: ABOUT_INSPIRE_URL,
        openExternal: true,
      },
      {
        title: 'Content Policy',
        url: CONTENT_POLICY_URL,
        openExternal: true,
      },
      {
        title: 'Privacy Policy',
        url: PRIVACY_POLICY_URL,
        openExternal: true,
      },
      {
        title: 'Terms of Use',
        url: TERMS_OF_USE_URL,
        openExternal: true,
      },
    ],
  },
  {
    title: 'Help',
    items: [
      {
        title: 'FAQ',
        url: FAQ_URL,
        openExternal: true,
      },
      {
        title: 'INSPIRE Help',
        url: HELP_BLOG_URL,
        openExternal: true,
      },
    ],
  },
  {
    title: 'Tools',
    items: [
      {
        title: 'Holdingpen',
        url: HOLDINGPEN_URL,
        openExternal: true,
      },
      {
        title: 'Author list',
        url: AUTHORLIST_TOOL_URL,
        openExternal: true,
      },
    ],
  },
  {
    title: 'Community',
    items: [
      {
        title: 'Blog',
        url: BLOG_URL,
        openExternal: true,
      },
      {
        title: 'Twitter',
        url: INSPIRE_TWITTER_ACCOUNT,
        openExternal: true,
      },
      {
        title: 'Contact',
        url: `mailto:${FEEDBACK_EMAIL}`,
        openExternal: true,
      },
    ],
  },
];

const BOTTOM = (
  <Row>
    <Col className="tl sm-tc" xs={24} md={12}>
      <ExternalLink href={INVENIO_URL}>Powered by Invenio</ExternalLink>
    </Col>
    <Col className="tr sm-tc" xs={24} md={12}>
      Made with <span className="red">❤</span> by the INSPIRE Team
    </Col>
  </Row>
);

function Footer() {
  return <RcFooter className="__Footer__" bottom={BOTTOM} columns={COLUMNS} />;
}

export default Footer;
