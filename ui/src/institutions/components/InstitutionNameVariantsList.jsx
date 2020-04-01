import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import InlineList from '../../common/components/InlineList';

function renderNameVariant(nameVariant) {
  return <span>{nameVariant.get('value')}</span>;
}

function extractKeyFromNameVariant(nameVariant) {
  return nameVariant.get('value');
}

function InstitutionsNameVariantsList({ nameVariants }) {
  return (
    <InlineList
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
