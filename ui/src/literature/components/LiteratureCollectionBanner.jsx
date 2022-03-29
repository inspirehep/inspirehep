import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'antd';
import ExternalLink from '../../common/components/ExternalLink.tsx';

function HiddenCollectionAlert({ collections }) {
  const shouldDisplayAlert = collections !== 'Literature';

  return (
    shouldDisplayAlert && (
      <div className="mb2">
        <Alert
          type="warning"
          message={
            <span>
              This record is not part of the INSPIRE Literature collection.
              <ExternalLink
                as="a"
                href="https://inspirehep.net/help/knowledge-base/faq/#faq-published"
              >
                Learn More
              </ExternalLink>
            </span>
          }
          showIcon={false}
        />
      </div>
    )
  );
}

HiddenCollectionAlert.propTypes = {
  collection: PropTypes.string,
};

export default HiddenCollectionAlert;
