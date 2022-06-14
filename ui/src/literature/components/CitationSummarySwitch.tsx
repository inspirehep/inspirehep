import React, { useEffect } from 'react';
import { BarChartOutlined } from '@ant-design/icons';
import { Switch, Tooltip } from 'antd';
import PropTypes from 'prop-types';

const CHART_ICON = <BarChartOutlined />;

function CitationSummarySwitch({
  checked,
  onCitationSummaryUserPreferenceChange,
  onChange,
  citationSummaryEnablingPreference,
}) {
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

CitationSummarySwitch.propTypes = {
  checked: PropTypes.bool.isRequired,
  onCitationSummaryUserPreferenceChange: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  citationSummaryEnablingPreference: PropTypes.bool.isRequired,
};

export default CitationSummarySwitch;
