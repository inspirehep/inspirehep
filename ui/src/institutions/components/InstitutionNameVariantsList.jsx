import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import InlineDataList from '../../common/components/InlineList';

function renderNameVariant(nameVariant) {
  return <span>{nameVariant.get('value')}</span>;
}

function extractKeyFromNameVariant(nameVariant) {
  return nameVariant.get('value');
}

function InstitutionsNameVariantsList({ nameVariants }) {
  return (
    <InlineDataList
      label="Name Variants"
      items={nameVariants}
      extractKey={extractKeyFromNameVariant}
      renderItem={renderNameVariant}
    />
  );
}

InstitutionsNameVariantsList.propTypes = {
  nameVariants: PropTypes.instanceOf(List),
};

export default InstitutionsNameVariantsList;
