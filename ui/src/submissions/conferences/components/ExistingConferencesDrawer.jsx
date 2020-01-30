import React from 'react';
import PropTypes from 'prop-types';
import './ExistingConferencesDrawer.scss';
import { Drawer } from 'antd';
import ResultsContainer from '../../../common/containers/ResultsContainer';
import ConferenceItem from '../../../conferences/components/ConferenceItem';
import { EXISTING_CONFERENCES_NS } from '../../../reducers/search';
import PaginationContainer from '../../../common/containers/PaginationContainer';
import pluralizeUnlessSingle from '../../../common/utils';

function renderConferenceItem(result) {
  return (
    <ConferenceItem metadata={result.get('metadata')} openDetailInNewTab />
  );
}

function ExistingConferencesDrawer({
  visible,
  onDrawerClose,
  numberOfConferences,
}) {
  return (
    <Drawer
      className="__ExistingConferencesDrawer__"
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

ExistingConferencesDrawer.propTypes = {
  visible: PropTypes.bool,
  onDrawerClose: PropTypes.func,
  numberOfConferences: PropTypes.number,
};

export default ExistingConferencesDrawer;
