import React from 'react';
import { List, Map } from 'immutable';

import InlineDataList from './InlineList';
import PublicationInfo from './PublicationInfo';

const PublicationInfoList = ({
  publicationInfo,
  labeled,
}: {
  publicationInfo: List<any>;
  labeled: boolean;
}) => {
  const label = labeled ? 'Published in' : undefined;
  return (
    <InlineDataList
      label={label}
      items={publicationInfo}
      extractKey={(info: Map<string, any>) =>
        info.get('journal_title') || info.get('pubinfo_freetext')
      }
      renderItem={(info: Map<string, any>) => <PublicationInfo info={info} />}
    />
  );
};

PublicationInfoList.defaultProps = {
  publicationInfo: null,
  labeled: true,
};

export default PublicationInfoList;
