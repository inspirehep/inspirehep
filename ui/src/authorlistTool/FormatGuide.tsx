function FormatItem({ example }: { example: string }) {
  return <p className="formatItem pre">{example}</p>;
}

function FormatGuide() {
  return (
    <div>
      Currently supported input string formats:
      <br />
      <br />
      <FormatItem example={`F. Lastname\nF.M. Otherlastname`} />
      <FormatItem
        example={`F. Lastname1, F M Otherlastname1,2\n\n1 CERN\n2 Otheraffiliation`}
      />
      <FormatItem
        example={`F. Lastname a\nF.M. Otherlastname b*\n\na\nCERN\nb\nOtheraffiliation`}
      />
      <FormatItem
        example={`F. Lastname * F. M. Otherlastname $1\n\n* CERN\n$ Otheraffiliation`}
      />
      You should make sure there is
      <ul>
        <li>an empty line between authors and affiliation</li>
        <li>no other empty lines </li>
        <li>only one affiliation per line </li>
        <li>aff-IDs in separate line or separated by space from affiliation</li>
      </ul>
    </div>
  );
}

export default FormatGuide;
