/* eslint-disable react/jsx-no-target-blank */
import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import useAsyncEffect from 'use-async-effect';

import FieldInfoAlert from '../../common/components/FieldInfoAlert';
import { CONFERENCES } from '../../../common/routes';
import http from '../../../common/http';
import pluralizeUnlessSingle from '../../../common/utils';

function ConferencesExistOnDatesAlert({ dates }) {
  const [openingDate, closingDate] = dates;
  const [numberOfConferences, setNumberOfConferences] = useState(null);
  const searchLink = useMemo(
    () =>
      `${CONFERENCES}?contains=${openingDate}--${closingDate}&start_date=all`,
    [openingDate, closingDate]
  );

  useAsyncEffect(
    async () => {
      try {
        // TODO: use header to get only count instead of whole results
        const response = await http.get(searchLink);
        const { total } = response.data.hits;
        setNumberOfConferences(total);
      } catch (error) {
        // TODO: handle error case properly when the requirements are clear
      }
    },
    [searchLink]
  );
  return (
    numberOfConferences && (
      <FieldInfoAlert
        description={
          <span>
            <strong>{numberOfConferences}</strong> other{' '}
            {pluralizeUnlessSingle('conference', numberOfConferences)} found in
            these dates.{' '}
            <a target="_blank" href={searchLink}>
              See here
            </a>
          </span>
        }
      />
    )
  );
}

ConferencesExistOnDatesAlert.propTypes = {
  dates: PropTypes.arrayOf(PropTypes.string),
};

export default ConferencesExistOnDatesAlert;
