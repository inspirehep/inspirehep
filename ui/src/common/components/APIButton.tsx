import { ApiOutlined } from '@ant-design/icons';

import IconText from './IconText';
import LinkWithTargetBlank from './LinkWithTargetBlank';
import UserAction from './UserAction';

export const APIButton = ({ url }: { url: string }) => {
  const transformUrl = (): string => {
    const parsedUrl = new URL(url);
    const { pathname } = parsedUrl;
    const newPathname = `/api${pathname}`;
    parsedUrl.pathname = newPathname;
    return parsedUrl.href;
  };

  return (
    <UserAction>
      <LinkWithTargetBlank href={transformUrl()}>
        <IconText icon={<ApiOutlined />} text="API" />
      </LinkWithTargetBlank>
    </UserAction>
  );
};
