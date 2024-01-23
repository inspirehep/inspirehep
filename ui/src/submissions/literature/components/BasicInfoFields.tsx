import React from 'react';
import { Field } from 'formik';

import { languageOptions } from '../schemas/constants';
import TextField from '../../common/components/TextField';
import ArrayOf from '../../common/components/ArrayOf';
import SelectField from '../../common/components/SelectField';
import TextAreaField from '../../common/components/TextAreaField';
import SuggesterField from '../../common/components/SuggesterField';
import LiteratureAuthorsField from './LiteratureAuthorsField';
import { inspireCategoryOptions } from '../../common/schemas/constants';
import { Suggestion } from '../../../types';

function BasicInfoFields({
  withCollaborationField,
  values,
}: {
  withCollaborationField: boolean;
  values: any;
}) {
  function getSuggestionSourceLegacyName(suggestion: Suggestion) {
    return suggestion._source.legacy_name;
  }

  return (
    <>
      <Field name="title" label="* Title" component={TextField} />
      <Field
        name="language"
        label="* Language"
        options={languageOptions}
        component={SelectField}
      />
      <Field
        name="subjects"
        label="* Subjects"
        mode="multiple"
        options={inspireCategoryOptions}
        component={SelectField}
      />
      <LiteratureAuthorsField
        values={values}
        name="authors"
        label="* Authors"
      />
      {withCollaborationField && (
        <Field
          name="collaboration"
          label="Collaboration"
          component={TextField}
        />
      )}
      <Field
        label="Experiment"
        name="experiment"
        recordFieldPath="experiment_record"
        placeholder="Experiment, type for suggestions"
        pidType="experiments"
        suggesterName="experiment"
        searchasyoutype="true"
        extractItemCompletionValue={getSuggestionSourceLegacyName}
        component={SuggesterField}
      />
      <Field
        name="abstract"
        label="Abstract"
        rows={4}
        component={TextAreaField}
      />
      <ArrayOf
        values={values}
        name="report_numbers"
        label="Report Numbers"
        emptyItem=""
        renderItem={(itemName: any) => (
          <Field onlyChild name={itemName} component={TextField} />
        )}
      />
      <Field
        name="doi"
        label="DOI"
        placeholder="e.g. 10.1086/305772 or doi:10.1086/305772"
        component={TextField}
      />
    </>
  );
}

BasicInfoFields.defaultProps = {
  withCollaborationField: false,
};

export default BasicInfoFields;
