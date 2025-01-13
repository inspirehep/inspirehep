import React from 'react';
import { Map } from 'immutable';
import { CopyOutlined, LinkOutlined, LinkedinOutlined, XOutlined } from '@ant-design/icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import orcidLogo from '../../common/assets/orcid.svg';

interface LinksProps {
  urls: Map<string, any>;
  ids: Map<string, any>;
}

function getLinkData(schema: string, value: string) {
  switch (schema) {
    case 'LINKEDIN':
      return {
        href: `https://www.linkedin.com/in/${value}`,
        icon: <LinkedinOutlined className="mr1" />,
      };
    case 'TWITTER':
      return {
        href: `https://x.com/${value}`,
        icon: <XOutlined className="mr1" />,
      };
    case 'BLUESKY':
      return {
        href: `https://bsky.app/profile/${value}`,
        icon: <XOutlined className="mr1" />,
      };
    case 'MASTODON': {
      const [user, host] = value.split('@');
      return {
        href: `https://${host}/@${user}`,
        icon: <XOutlined className="mr1" />,
      };
    }
    case 'ORCID':
      return {
        href: `https://orcid.org/${value}`,
        icon: (
          <img
            src={orcidLogo}
            alt="ORCID"
            width={16}
            height={16}
            className="mr1"
          />
        ),
        show_copy_btn: true,
      };
    default:
      return {
        href: value,
        icon: <LinkOutlined className="mr1" />,
      };
  }
}

export const Ids: React.FC<{ ids: Map<string, any>; noIcon?: boolean }> = ({
  ids,
  noIcon = false,
}) => (
  <>
    {ids?.map((link: Map<string, any>) => {
        const schema = link?.get('schema');
        const value = link?.get('value');
        const linkData = getLinkData(schema, value);
        const icon = linkData?.icon;
        const href = linkData?.href;
        const showCopyBtn = linkData?.show_copy_btn;

        return (
          <p key={value} className={noIcon ? 'mb0' : ''}>
            {!noIcon && icon}
            {schema && (
              <b className="dib ttc">{schema.toLowerCase()}:</b>
            )}{' '}
            <a href={href} target="_blank"> {value} </a>
            {showCopyBtn && (
              <CopyToClipboard text={value}>
                <span className="ml1 pointer"><CopyOutlined /></span>
              </CopyToClipboard>
            )}
          </p>
        );
    })}
  </>
);

export const Urls: React.FC<{ urls: Map<string, any> }> = ({ urls }) => (
  <>
    {urls?.map((link: Map<string, any>) => {
      const schema = link?.get('schema');
      const value = link?.get('value');
      const description = link?.get('description');
      const linkData = getLinkData(schema, value);
      return (
        <p key={value}>
          {linkData?.icon}
          {description && (
            <b className="dib ml1 ttc">{description}:</b>
          )}{' '}
          <a href={value} target="_blank">
            {value}
          </a>
        </p>
      );
    })}
  </>
);

const Links: React.FC<LinksProps> = ({ urls, ids }) => {
  return (
    <>
      <Ids ids={ids} />
      <Urls urls={urls} />
    </>
  );
};

export default Links;
