import React from 'react';
import { Drawer } from 'antd';
import ResultsContainer from '../../../common/containers/ResultsContainer';
import ConferenceItem from '../../../conferences/components/ConferenceItem';
import { EXISTING_CONFERENCES_NS } from '../../../search/constants';
import PaginationContainer from '../../../common/containers/PaginationContainer';
import pluralizeUnlessSingle from '../../../common/utils';

function renderConferenceItem(result: $TSFixMe) {
  return (
    <ConferenceItem metadata={result.get('metadata')} openDetailInNewTab />
  );
}

type Props = {
    visible?: boolean;
    onDrawerClose?: $TSFixMeFunction;
    numberOfConferences?: number;
};

function ExistingConferencesDrawer({ visible, onDrawerClose, numberOfConferences, }: Props) {
  return (
    <Drawer
      className="search-drawer"
      placement="right"
      closable={false}
      onClose={onDrawerClose}
      visible={visible}
    >
      <p>
        <strong>{numberOfConferences}</strong>{' '}
        {pluralizeUnlessSingle('conference', numberOfConferences)} found in
        these dates:
      </p>
      <ResultsContainer
        namespace={EXISTING_CONFERENCES_NS}
        renderItem={renderConferenceItem}
      />
      <PaginationContainer namespace={EXISTING_CONFERENCES_NS} />
    </Drawer>
  );
}

export default ExistingConferencesDrawer;
