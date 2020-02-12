import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Switch, Popconfirm } from 'antd';
import OrcidPushSettingMessageContainer from '../containers/OrcidPushSettingMessageContainer';
import ExternalLink from '../../common/components/ExternalLink';

function renderPopConfirmTitle(isCurrentlyEnabled, authorBAI) {
  return (
    <>
      {isCurrentlyEnabled ? (
        <p>
          Your INSPIRE works will no longer be exported to your ORCID account.
        </p>
      ) : (
        <p>
          Your INSPIRE{' '}
          <ExternalLink href={`//inspirehep.net/author/claim/${authorBAI}`}>
            claimed
          </ExternalLink>{' '}
          works will be exported to your ORCID account.
        </p>
      )}
      <span>Are you sure?</span>
    </>
  );
}

function OrcidPushSetting({ isUpdating, onChange, enabled, authorBAI }) {
  const onSettingToggleConfirm = useCallback(
    () => {
      onChange(!enabled);
    },
    [enabled, onChange]
  );
  return (
    <>
      <div className="mb3">
        <span className="mr2">Export your INSPIRE works to ORCID</span>
        <Popconfirm
          title={renderPopConfirmTitle(enabled, authorBAI)}
          onConfirm={onSettingToggleConfirm}
        >
          <Switch loading={isUpdating} checked={enabled} />
        </Popconfirm>
      </div>
      <div>
        <OrcidPushSettingMessageContainer />
      </div>
    </>
  );
}

OrcidPushSetting.propTypes = {
  onChange: PropTypes.func.isRequired,
  isUpdating: PropTypes.bool.isRequired,
  enabled: PropTypes.bool.isRequired,
  authorBAI: PropTypes.string.isRequired,
};

export default OrcidPushSetting;
