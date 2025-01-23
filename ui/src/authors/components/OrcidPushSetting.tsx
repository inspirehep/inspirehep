import React, { useCallback } from 'react';
import { Switch, Popconfirm } from 'antd';

import OrcidPushSettingMessageContainer from '../containers/OrcidPushSettingMessageContainer';

function renderPopConfirmTitle(isCurrentlyEnabled: boolean) {
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

function OrcidPushSetting({
  isUpdating,
  onChange,
  enabled,
}: {
  isUpdating: boolean;
  onChange: Function;
  enabled: boolean;
}) {
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
          <Switch
            loading={isUpdating}
            checked={enabled}
            data-test-id="orcid-switch"
          />
        </Popconfirm>
      </div>
      <div>
        <OrcidPushSettingMessageContainer />
      </div>
    </>
  );
}

export default OrcidPushSetting;
