import { dump } from 'js-yaml';

interface AuthorsYamlProps {
  authors: unknown[];
}

function AuthorsYaml({ authors }: AuthorsYamlProps) {
  const yamlText = dump(
    { authors },
    {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
    }
  );

  return <pre>{yamlText}</pre>;
}

export default AuthorsYaml;
