import { ObjectFieldTemplateProps } from '@rjsf/utils/lib/types';

function DefaultObjectFieldTemplate(props: ObjectFieldTemplateProps) {
  return (
    <div>
      {props.properties.map((element) => (
        <div className="property-wrapper" key={element.name}>
          {element.content}
        </div>
      ))}
    </div>
  );
}

export default DefaultObjectFieldTemplate;
