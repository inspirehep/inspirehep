import { WidgetProps } from '@rjsf/utils';

import Suggester from '../../../common/components/Suggester';

type SuggesterForWidgetProps = WidgetProps & {
  onSelectSuggestion: (controlNumber: string, suggestion: any) => void;
  pidType: string;
  suggesterName: string;
  extractUniqueItemValue: (suggestion: any) => string;
  extractItemCompletionValue: (suggestion: any) => string;
  readonly?: boolean;
};

function SuggesterForWidget({
  id,
  value,
  onChange,
  onBlur,
  onSelectSuggestion,
  pidType,
  suggesterName,
  extractUniqueItemValue,
  extractItemCompletionValue,
  readonly,
}: SuggesterForWidgetProps) {
  return (
    <Suggester
      id={id}
      value={value}
      style={{ width: '200px' }}
      placeholder="Type for suggestions"
      pidType={pidType}
      suggesterName={suggesterName}
      searchasyoutype="true"
      extractUniqueItemValue={extractUniqueItemValue}
      extractItemCompletionValue={extractItemCompletionValue}
      onChange={onChange}
      onSelect={onSelectSuggestion}
      onBlur={() => onBlur(id, value)}
      disabled={readonly}
    />
  );
}

export default SuggesterForWidget;
