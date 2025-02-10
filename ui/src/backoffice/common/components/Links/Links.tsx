import React from 'react';
import { Map } from 'immutable';
import Icon, {
  CopyOutlined,
  LinkOutlined,
  LinkedinOutlined,
  XOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { ReactComponent as mastodonLogo } from '../../../../common/assets/mastodon.svg';
import { ReactComponent as blueskyLogo } from '../../../../common/assets/bluesky.svg';
import { ReactComponent as orcidLogo } from '../../../../common/assets/orcid.svg';

type LinksProps = {
  urls: Map<string, any>;
  ids: Map<string, any>;
};

type IdsProps = {
  ids: Map<string, any>;
  noIcon?: boolean;
};

type UrlsProps = {
  urls: Map<string, any>;
};

type SocialPlatformMap = Record<string, string>;

const socialPlatformMap: SocialPlatformMap = {
  ORCID: 'ORCID',
  MASTODON: 'Mastodon',
  LINKEDIN: 'LinkedIn',
  BLUESKY: 'Bluesky',
  TWITTER: 'Twitter',
};

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
        icon: <Icon component={blueskyLogo} className="mr1" />,
      };
    case 'MASTODON': {
      const [user, host] = value.split('@');
      return {
        href: `https://${host}/@${user}`,
        icon: <Icon component={mastodonLogo} className="mr1" />,
      };
    }
    case 'ORCID':
      return {
        href: `https://orcid.org/${value}`,
        icon: <Icon component={orcidLogo} className="mr1" />,
        show_copy_btn: true,
      };
    case 'CERN': {
      return {
        icon: <UserOutlined className="mr1" />,
      };
    }
    case 'INSPIRE ID': {
      return {
        icon: <UserOutlined className="mr1" />,
      };
    }
    case 'INSPIRE BAI': {
      return {
        icon: <UserOutlined className="mr1" />,
      };
    }
    default:
      return {
        href: value,
        icon: <LinkOutlined className="mr1" />,
      };
  }
}

const Id = ({
  schema,
  value,
  href,
}: {
  schema: string;
  value: string;
  href: string | undefined;
}) => {
  if (!href) {
    return <span>{value}</span>;
  }
  return (
    <a href={href} target="_blank">
      {' '}
      {value}{' '}
    </a>
  );
};

export const Ids = ({ ids, noIcon = false }: IdsProps) => (
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
            <b className="dib ttc">{socialPlatformMap[schema] || schema}:</b>
          )}{' '}
          <Id schema={schema} value={value} href={href} />
          {showCopyBtn && (
            <CopyToClipboard text={value}>
              <span className="ml1 pointer">
                <CopyOutlined />
              </span>
            </CopyToClipboard>
          )}
        </p>
      );
    })}
  </>
);

export const Urls = ({ urls }: UrlsProps) => (
  <>
    {urls?.map((link: Map<string, any>) => {
      const schema = link?.get('schema');
      const value = link?.get('value');
      const description = link?.get('description');
      const linkData = getLinkData(schema, value);
      return (
        <p key={value}>
          {linkData?.icon}
          {description && <b className="dib ml1 ttc">{description}:</b>}{' '}
          <a href={value} target="_blank">
            {value}
          </a>
        </p>
      );
    })}
  </>
);

const Links = ({ urls, ids }: LinksProps) => {
  return (
    <>
      <Ids ids={ids} />
      <Urls urls={urls} />
    </>
  );
};

export default Links;
