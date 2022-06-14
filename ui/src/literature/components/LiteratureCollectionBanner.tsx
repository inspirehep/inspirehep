import React from 'react';
import { Alert } from 'antd';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../../common/components/ExternalLink.tsx';

function HiddenCollectionAlert() {
  return (
    <div className="mb2">
      <Alert
        type="warning"
        message={
          <span>
            This record is not part of the INSPIRE Literature collection.{' '}
            <ExternalLink
              as="a"
              href="https://inspirehep.net/help/knowledge-base/faq/#not-part"
            >
              Learn More
            </ExternalLink>
          </span>
        }
      />
    </div>
  );
}

export default HiddenCollectionAlert;
