import React from 'react';
import { Alert } from 'antd';

import LinkWithTargetBlank from '../../common/components/LinkWithTargetBlank';

function HiddenCollectionAlert() {
  return (
    <div className="mb2">
      <Alert
        type="warning"
        message={
          <span>
            This record is not part of the INSPIRE Literature collection.{' '}
            <LinkWithTargetBlank
              as="a"
              href="https://help.inspirehep.net/knowledge-base/faq/#not-part"
            >
              Learn More
            </LinkWithTargetBlank>
          </span>
        }
      />
    </div>
  );
}

export default HiddenCollectionAlert;
