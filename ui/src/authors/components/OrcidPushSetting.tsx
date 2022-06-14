import React, { useCallback } from 'react';
import { Switch, Popconfirm } from 'antd';
import OrcidPushSettingMessageContainer from '../containers/OrcidPushSettingMessageContainer';

function renderPopConfirmTitle(isCurrentlyEnabled: $TSFixMe) {
  return (
    <>
      {isCurrentlyEnabled ? (
        <p>
          Your INSPIRE works will no longer be exported to your ORCID account.
        </p>
      ) : (
        <p>
          Your INSPIRE claimed works will be exported to your ORCID account.
        </p>
      )}
      <span>Are you sure?</span>
    </>
  );
}

type Props = {
    onChange: $TSFixMeFunction;
    isUpdating: boolean;
    enabled: boolean;
};

function OrcidPushSetting({ isUpdating, onChange, enabled }: Props) {
  const onSettingToggleConfirm = useCallback(() => {
    onChange(!enabled);
  }, [enabled, onChange]);
  return (
    <>
      <div className="mb3">
        <span className="mr2">Export your INSPIRE works to ORCID</span>
        <Popconfirm
          title={renderPopConfirmTitle(enabled)}
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

export default OrcidPushSetting;
