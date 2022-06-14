import React, { useEffect } from 'react';
import { BarChartOutlined } from '@ant-design/icons';
import { Switch, Tooltip } from 'antd';

const CHART_ICON = <BarChartOutlined />;

type Props = {
    checked: boolean;
    onCitationSummaryUserPreferenceChange: $TSFixMeFunction;
    onChange: $TSFixMeFunction;
    citationSummaryEnablingPreference: boolean;
};

function CitationSummarySwitch({ checked, onCitationSummaryUserPreferenceChange, onChange, citationSummaryEnablingPreference, }: Props) {
  useEffect(
    () => {
      onCitationSummaryUserPreferenceChange(citationSummaryEnablingPreference);
    },
    [onCitationSummaryUserPreferenceChange, citationSummaryEnablingPreference]
  );
  const actionName = checked ? 'Hide' : 'Show';
  const tooltipHelp = `${actionName} Citation Summary`;
  return (
    <Tooltip title={tooltipHelp}>
      <Switch
        checkedChildren={CHART_ICON}
        unCheckedChildren={CHART_ICON}
        checked={checked}
        onChange={onChange}
      />
    </Tooltip>
  );
}

export default CitationSummarySwitch;
