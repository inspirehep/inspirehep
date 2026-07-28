import { ObjectFieldTemplateProps } from '@rjsf/utils';
import { useFieldOnChange } from '../../../FieldOnChangeContext';
import { ObjectFieldDataContext } from '../../../ObjectFieldDataContext';

function ArrayItemObjectFieldTemplate({
  properties,
  formData,
}: ObjectFieldTemplateProps) {
  const onChange = useFieldOnChange();

  return (
    <ObjectFieldDataContext.Provider
      value={{
        formData: (formData as Record<string, unknown>) ?? {},
        onChange,
      }}
    >
      {properties.map((element) => {
        return (
          <td key={element.name} className="record-editor-array__cell">
            {element.content}
          </td>
        );
      })}
    </ObjectFieldDataContext.Provider>
  );
}

export default ArrayItemObjectFieldTemplate;
