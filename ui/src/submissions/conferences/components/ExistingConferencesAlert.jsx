import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

import { Button } from 'antd';
import FieldInfoAlert from '../../common/components/FieldInfoAlert';
import pluralizeUnlessSingle from '../../../common/utils';
import ExistingConferencesDrawer from './ExistingConferencesDrawer';

function ExistingConferencesAlert({
  onDatesChange,
  dates,
  numberOfConferences,
}) {
  const [openingDate, closingDate] = dates;
  const [isDrawerVisible, setDrawerVisible] = useState(false);

  const onShowMoreClick = useCallback(() => setDrawerVisible(true), []);
  const onDrawerClose = useCallback(() => setDrawerVisible(false), []);

  useEffect(
    () => {
      if (openingDate && closingDate) {
        onDatesChange([openingDate, closingDate]);
      }
    },
    [onDatesChange, openingDate, closingDate]
  );

  return (
    numberOfConferences > 0 && (
      <>
        <FieldInfoAlert
          description={
            <span>
              <strong data-test-id="conferences-exist-alert-number">
                {numberOfConferences}
              </strong>{' '}
              other {pluralizeUnlessSingle('conference', numberOfConferences)}{' '}
              found in these dates.
              <Button type="link" size="small" onClick={onShowMoreClick}>
                Show more
              </Button>
            </span>
          }
        />
        <ExistingConferencesDrawer
          visible={isDrawerVisible}
          onDrawerClose={onDrawerClose}
          numberOfConferences={numberOfConferences}
        />
      </>
    )
  );
}

ExistingConferencesAlert.propTypes = {
  onDatesChange: PropTypes.func.isRequired,
  dates: PropTypes.arrayOf(PropTypes.string).isRequired,
  numberOfConferences: PropTypes.number,
};

export default ExistingConferencesAlert;
