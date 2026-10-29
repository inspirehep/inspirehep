import { WidgetProps } from '@rjsf/utils';

import { useObjectFieldData } from '../../ObjectFieldDataContext';
import SuggesterForWidget from '../SuggesterForWidget';

interface ProjectSuggestion {
  _source: {
    control_number: number;
    legacy_name: string;
  };
}

function getProjectControlNumber(suggestion: ProjectSuggestion) {
  return String(suggestion._source.control_number);
}

function getProjectLegacyName(suggestion: ProjectSuggestion) {
  return suggestion._source.legacy_name;
}

function ProjectNameAutocompleteWidget({
  id,
  value,
  onChange,
  onBlur,
  ...props
}: WidgetProps) {
  const {
    formData: projectMembershipFormData,
    onChange: onProjectMembershipChange,
  } = useObjectFieldData();

  const onProjectNameChange = (newValue: string) => {
    onChange(newValue);

    if (projectMembershipFormData.record) {
      onProjectMembershipChange({
        ...projectMembershipFormData,
        name: newValue,
        record: undefined,
        curated_relation: false,
      });
    }
  };

  const onProjectNameSelect = (
    controlNumber: string,
    suggestion: ProjectSuggestion
  ) => {
    onProjectMembershipChange({
      ...projectMembershipFormData,
      name: getProjectLegacyName(suggestion),
      record: {
        $ref: `${window.location.origin}/api/experiments/${controlNumber}`,
      },
      curated_relation: true,
    });
  };

  return (
    <SuggesterForWidget
      id={id}
      value={value}
      pidType="experiments"
      suggesterName="experiment"
      extractUniqueItemValue={getProjectControlNumber}
      extractItemCompletionValue={getProjectLegacyName}
      onChange={onProjectNameChange}
      onSelectSuggestion={onProjectNameSelect}
      onBlur={() => onBlur(id, value)}
      {...props}
    />
  );
}

export default ProjectNameAutocompleteWidget;
