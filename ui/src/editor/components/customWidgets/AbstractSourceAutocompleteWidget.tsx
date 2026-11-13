import { WidgetProps } from '@rjsf/utils';

import SuggesterForWidget from '../SuggesterForWidget';

interface AbstractSourceSuggestion {
  text: string;
}

function getAbstractSource(suggestion: AbstractSourceSuggestion) {
  return suggestion.text;
}

function AbstractSourceAutocompleteWidget({
  id,
  value,
  onChange,
  onBlur,
  ...props
}: WidgetProps) {
  return (
    <SuggesterForWidget
      id={id}
      value={value}
      pidType="literature"
      suggesterName="abstract_source"
      searchAsYouType={false}
      extractUniqueItemValue={getAbstractSource}
      extractItemCompletionValue={getAbstractSource}
      onChange={(newValue: string) => onChange(newValue)}
      onSelectSuggestion={() => {}}
      onBlur={() => onBlur(id, value)}
      {...props}
    />
  );
}

export default AbstractSourceAutocompleteWidget;
