import { UiSchema } from '@rjsf/utils';

import TableObjectFieldTemplate from '../components/customTemplates/objectFieldTemplates/TableObjectFieldTemplate';
import ObjectPropertyFieldTemplate from '../components/customTemplates/fieldTemplates/ObjectPropertyFieldTemplate';
import NestedArrayFieldTemplate from '../components/customTemplates/arrayFieldTemplates/NestedArrayFieldTemplate';
import NestedArrayFieldItemTemplate from '../components/customTemplates/arrayFieldTemplates/NestedArrayFieldItemTemplate';
import NestedWithHeaderArrayFieldTemplate from '../components/customTemplates/arrayFieldTemplates/NestedWithHeaderArrayFieldTemplate';
import DefaultArrayFieldItemTemplate from '../components/customTemplates/arrayFieldTemplates/DefaultArrayFieldItemTemplate';
import ArrayItemObjectFieldTemplate from '../components/customTemplates/objectFieldTemplates/ArrayItemObjectFieldTemplate';

export const property = (title: string, extra: UiSchema = {}): UiSchema => ({
  'ui:FieldTemplate': ObjectPropertyFieldTemplate,
  'ui:title': title,
  ...extra,
});

export const recordLink = (
  title: string,
  refUiSchema: UiSchema = { 'ui:widget': 'viewRecordWidget' }
): UiSchema => property(title, { $ref: refUiSchema });

export const stringList = (title: string): UiSchema => ({
  'ui:ArrayFieldTemplate': NestedArrayFieldTemplate,
  'ui:ArrayFieldItemTemplate': NestedArrayFieldItemTemplate,
  'ui:title': title,
  items: { 'ui:options': { label: false } },
});

export const objectList = (title: string, order: string[]): UiSchema => ({
  'ui:ArrayFieldTemplate': NestedWithHeaderArrayFieldTemplate,
  'ui:ArrayFieldItemTemplate': DefaultArrayFieldItemTemplate,
  'ui:title': title,
  items: {
    'ui:ObjectFieldTemplate': ArrayItemObjectFieldTemplate,
    'ui:order': order,
    ...Object.fromEntries(
      order.map((name) => [name, { 'ui:options': { label: false } }])
    ),
  },
});

export const tableObject = (
  title: string,
  order: string[],
  properties: Record<string, string | UiSchema> = {}
): UiSchema => ({
  'ui:FieldTemplate': ObjectPropertyFieldTemplate,
  'ui:ObjectFieldTemplate': TableObjectFieldTemplate,
  'ui:title': title,
  'ui:options': { showHeader: false },
  'ui:order': order,
  ...Object.fromEntries(
    order.map((name) => {
      const override = properties[name];
      return [
        name,
        typeof override === 'object'
          ? override
          : property(override ?? name.replace(/_/g, ' ')),
      ];
    })
  ),
});
