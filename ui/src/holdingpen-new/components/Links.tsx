import React from 'react';
import { Map } from 'immutable';
import {
  LinkOutlined,
  LinkedinOutlined,
  TwitterOutlined,
} from '@ant-design/icons';

import orcidLogo from '../../common/assets/orcid.svg';

interface LinksProps {
  urls: Map<string, any>;
  ids: Map<string, any>;
}

const Links: React.FC<LinksProps> = ({ urls, ids }) => {
  function getLinkData(schema: string, value: string) {
    switch (schema) {
      case 'LINKEDIN':
        return {
          href: `https://www.linkedin.com/in/${value}`,
          icon: <LinkedinOutlined />,
        };
      case 'TWITTER':
        return {
          href: `https://twitter.com/${value}`,
          icon: <TwitterOutlined />,
        };
      case 'ORCID':
        return {
          href: `https://orcid.org/my-orcid?orcid=${value}`,
          icon: <img src={orcidLogo} alt="ORCID" width={16} height={16} />,
        };
      default:
        return {
          href: value,
          icon: <LinkOutlined />,
        };
    }
  }
  return (
    <>
      {ids?.map((link: Map<string, any>) => (
        <p key={link?.get('value')}>
          {getLinkData(link?.get('schema'), link?.get('value'))?.icon}
          {link?.get('schema') && (
            <b className="dib ml1 ttc">{link?.get('schema').toLowerCase()}:</b>
          )}{' '}
          <a
            href={getLinkData(link?.get('schema'), link?.get('value'))?.href}
            target="_blank"
          >
            {link?.get('value')}
          </a>
        </p>
      ))}
      {urls?.map((link: Map<string, any>) => (
        <p key={link?.get('value')}>
          {getLinkData(link?.get('schema'), link?.get('value'))?.icon}
          {link?.get('description') && (
            <b className="dib ml1 ttc">{link?.get('description')}:</b>
          )}{' '}
          <a href={link?.get('value')} target="_blank">
            {link?.get('value')}
          </a>
        </p>
      ))}
    </>
  );
};

export default Links;
