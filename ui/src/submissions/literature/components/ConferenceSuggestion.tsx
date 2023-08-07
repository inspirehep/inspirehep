import React from 'react';

function ConferenceSuggestion({ conference }: { conference: any }) {
  const { cnum, acronyms, address, titles } = conference;
  const { title } = titles[0];
  const openingDate = conference.opening_date;
  const firstAcronym = acronyms && acronyms[0];
  const firstAddress = (address && address[0]) || {};
  const countryCode = firstAddress.country_code;
  const city = firstAddress.cities && firstAddress.cities[0];
  return (
    <>
      <div>
        <strong>{title}</strong>
      </div>
      <div className="f7">
        <div>{firstAcronym && <span>({firstAcronym})</span>}</div>
        <div>
          <span>{openingDate} </span>
          <span>
            {city && <span>{city}, </span>} {countryCode}
          </span>
        </div>
        <div>
          <span>{cnum}</span>
        </div>
      </div>
    </>
  );
}

export default ConferenceSuggestion;
