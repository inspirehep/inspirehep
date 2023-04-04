import React from 'react';
import { List } from 'immutable';

import InlineDataList from './InlineList';
import LinkWithTargetBlank from './LinkWithTargetBlank';

const URLList = ({
  urls,
  wrapperClassName,
}: {
  urls: List<any>;
  wrapperClassName: string;
}) => {
  const renderURLItem = (url: Map<string, string>) => (
    <LinkWithTargetBlank href={url.get('value')}>
      {url.get('value')}
    </LinkWithTargetBlank>
  );

  return (
    <InlineDataList
      wrapperClassName={wrapperClassName}
      items={urls}
      extractKey={(url: Map<String, string>) => url.get('value')}
      renderItem={renderURLItem}
    />
  );
};

URLList.defaultProps = {
  urls: null,
  wrapperClassName: null,
};

export default URLList;
