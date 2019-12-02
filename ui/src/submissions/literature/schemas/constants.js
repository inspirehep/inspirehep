import getValue from '../../common/getValue';

export const languageOptions = [
  { value: 'en', display: 'English' },
  { value: 'zh', display: 'Chinese' },
  { value: 'fr', display: 'French' },
  { value: 'de', display: 'German' },
  { value: 'it', display: 'Italian' },
  { value: 'ja', display: 'Japanese' },
  { value: 'pt', display: 'Portuguese' },
  { value: 'ru', display: 'Russian' },
  { value: 'es', display: 'Spanish' },
  { value: 'oth', display: 'Other' },
];
export const languageValues = languageOptions.map(getValue);
