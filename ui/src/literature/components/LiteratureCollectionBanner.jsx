import React from 'react';
import { Alert } from 'antd';
import ExternalLink from '../../common/components/ExternalLink';

function HiddenCollectionAlert() {
  return (
    <div className="mb2">
      <Alert
        type="warning"
        message={(
          <span>
            This record is not part of the INSPIRE Literature collection.
            {' '}
            <ExternalLink
              as="a"
              href="https://help.inspirehep.net/knowledge-base/faq/#not-part"
            >
              Learn More
            </ExternalLink>
          </span>
)}
      />
    </div>
  );
}

export default HiddenCollectionAlert;
