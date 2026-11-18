import { WidgetProps } from '@rjsf/utils';

import { useObjectFieldData } from '../../ObjectFieldDataContext';
import SuggesterForWidget from '../SuggesterForWidget';

interface JournalSuggestion {
  _source: {
    control_number: number;
    short_title: string;
    self: { $ref: string };
  };
}

function getJournalControlNumber(suggestion: JournalSuggestion) {
  return String(suggestion._source.control_number);
}

function getJournalShortTitle(suggestion: JournalSuggestion) {
  return suggestion._source.short_title;
}

function JournalTitleAutocompleteWidget({
  id,
  value,
  onChange,
  onBlur,
  ...props
}: WidgetProps) {
  const {
    formData: publicationInfoFormData,
    onChange: onPublicationInfoChange,
  } = useObjectFieldData();

  const onJournalTitleChange = (newValue: string) => {
    onChange(newValue);

    if (publicationInfoFormData.journal_record) {
      onPublicationInfoChange({
        ...publicationInfoFormData,
        journal_title: newValue,
        journal_record: undefined,
        curated_relation: false,
      });
    }
  };

  const onJournalTitleSelect = (
    _controlNumber: string,
    suggestion: JournalSuggestion
  ) => {
    onPublicationInfoChange({
      ...publicationInfoFormData,
      journal_title: getJournalShortTitle(suggestion),
      journal_record: suggestion._source.self,
      curated_relation: true,
    });
  };

  return (
    <SuggesterForWidget
      id={id}
      value={value}
      pidType="journals"
      suggesterName="journal_title"
      searchAsYouType={false}
      extractUniqueItemValue={getJournalControlNumber}
      extractItemCompletionValue={getJournalShortTitle}
      onChange={onJournalTitleChange}
      onSelectSuggestion={onJournalTitleSelect}
      onBlur={() => onBlur(id, value)}
      {...props}
    />
  );
}

export default JournalTitleAutocompleteWidget;
