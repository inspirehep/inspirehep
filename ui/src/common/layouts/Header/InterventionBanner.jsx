import React, { Component } from 'react';
import { Alert } from 'antd';

import ExternalLink from '../../components/ExternalLink';
import { getConfigFor } from '../../config';

class InterventionBanner extends Component {
  render() {
    const interventionConfig =
      getConfigFor('REACT_APP_INTERVENTION_BANNER') || null;
    return (
      interventionConfig && (
        <div className="intervention-banner">
          <Alert
            type="warning"
            banner
            showIcon={false}
            message={
              <>
                {interventionConfig.message}
                {interventionConfig.link && (
                  <>
                    .{' '}
                    <ExternalLink href={interventionConfig.link}>
                      More info
                    </ExternalLink>.
                  </>
                )}
              </>
            }
          />
        </div>
      )
    );
  }
}

export default InterventionBanner;
