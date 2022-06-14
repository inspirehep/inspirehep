import CollapsableForm from './CollapsableForm';
import CollapsableFormSection from './CollapseFormSection';

// @ts-expect-error ts-migrate(2339) FIXME: Property 'Section' does not exist on type 'typeof ... Remove this comment to see the full error message
CollapsableForm.Section = CollapsableFormSection;

export default CollapsableForm;
