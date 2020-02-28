import React from 'react';
import { BarChartOutlined } from '@ant-design/icons';
import { Switch, Tooltip } from 'antd';

const CHART_ICON = <BarChartOutlined />;

function CitationSummarySwitch(props) {
  const { checked } = props;

  const actionName = checked ? 'Hide' : 'Show';
  const tooltipHelp = `${actionName} Citation Summary`;
  return (
    <Tooltip title={tooltipHelp}>
      <Switch
        checkedChildren={CHART_ICON}
        unCheckedChildren={CHART_ICON}
        {...props}
      />
    </Tooltip>
  );
}

export default CitationSummarySwitch;
