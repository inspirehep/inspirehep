import { WidgetProps } from '@rjsf/utils';

import { useObjectFieldData } from '../../ObjectFieldDataContext';
import SuggesterForWidget from '../SuggesterForWidget';

interface InstitutionSuggestion {
  _source: {
    control_number: number;
    legacy_ICN: string;
  };
}

function getInstitutionControlNumber(suggestion: InstitutionSuggestion) {
  return String(suggestion._source.control_number);
}

function getInstitutionLegacyICN(suggestion: InstitutionSuggestion) {
  return suggestion._source.legacy_ICN;
}

function InstitutionAutocompleteWidget({
  id,
  value,
  onChange,
  onBlur,
  ...props
}: WidgetProps) {
  const { formData: positionFormData, onChange: onPositionChange } =
    useObjectFieldData();

  const onInstitutionChange = (newValue: string) => {
    onChange(newValue);

    if (positionFormData.record) {
      onPositionChange({
        ...positionFormData,
        institution: newValue,
        record: undefined,
        curated_relation: false,
      });
    }
  };

  const onInstitutionSelect = (
    controlNumber: string,
    suggestion: InstitutionSuggestion
  ) => {
    onPositionChange({
      ...positionFormData,
      institution: getInstitutionLegacyICN(suggestion),
      record: {
        $ref: `${window.location.origin}/api/institutions/${controlNumber}`,
      },
      curated_relation: true,
    });
  };

  return (
    <SuggesterForWidget
      id={id}
      value={value}
      pidType="institutions"
      suggesterName="affiliation"
      extractUniqueItemValue={getInstitutionControlNumber}
      extractItemCompletionValue={getInstitutionLegacyICN}
      onChange={onInstitutionChange}
      onSelectSuggestion={onInstitutionSelect}
      onBlur={() => onBlur(id, value)}
      {...props}
    />
  );
}

export default InstitutionAutocompleteWidget;
