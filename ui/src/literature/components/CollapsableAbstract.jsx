import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Collapse } from 'antd';

import Latex from '../../common/components/Latex';

class CollapsableAbstract extends Component {
  render() {
    const { abstract } = this.props;
    return (
      abstract && (
        <Collapse className="bg-transparent" bordered={false}>
          <Collapse.Panel style={{ border: 0 }} header="Abstract">
            <Latex>{abstract}</Latex>
          </Collapse.Panel>
        </Collapse>
      )
    );
  }
}

CollapsableAbstract.propTypes = {
  abstract: PropTypes.string,
};

CollapsableAbstract.defaultProps = {
  abstract: null,
};

export default CollapsableAbstract;
