OSTI_USERNAME = "change me"
OSTI_PASSWORD = "change me"
OSTI_URL = "https://www.osti.gov/elinktest/2416api"

PRODUCT_TYPE_MAPPING = {
    "ANNUAL": "PD",
    "BACHELORS": "TD",
    "BOOK": "B",
    "CONF": "CO",
    "CRADA": "TR",
    "D0-EN": "TR",
    "DESIGN": "TR",
    "FACTSHEET": "FS",
    "FN": "TR",
    "HABILITATION": "TD",
    "INDUSTRIAL": "PD",
    "LOI": "TR",
    "LU": "TR",
    "MASTERS": "TD",
    "MISC": "TR",
    "MONTHLY": "PD",
    "MICROBOONE": "TR",
    "MUCOOL": "TR",
    "PLAN": "PD",
    "POSTER": "CO",
    "PROPOSAL": "TR",
    "PUB": "JA",
    "REVIEW": "PD",
    "SLIDES": "CO",
    "THESIS": "TD",
    "TM": "TR",
    "VLHCPUB": "TR",
}

PRODUCT_SUBTYPE_MAPPING = {
    "POSTER": "O",
    "SLIDES": "R",
    "CONF": "A",
}

ACCEPTED_PDF_DESCRIPTIONS = [
    "article from scoap3",
    "fermilab accepted manuscript",
    "fulltext from publisher",
    "open access fulltext",
]

FERMILAB_DESCRIPTIONS = [
    "fermilab library server",
    "fermilab library server (fulltext available)",
    "fermilabbook",
    "fermilabposter",
    "fermilabslides",
]

OSTI_FIELDS_TO_FERMILAB_DETAILS_MAPPING = {
    "doe_contract_nos": "AC02-07CH11359",
    "site_input_code": "FNAL",
    "country_publication_code": "US",
    "sponsor_org": "USDOE Office of Science (SC), High Energy Physics (HEP) (SC-25)",
    "released_by": "Heath O'Connell",
    "released_by_email": "hoc@fnal.gov",
    "released_by_phone": "630-840-6017",
    "medium_code": "ED",
    "file_format": "PDF/A",
}

INSPIRE_TO_OSTI_AFF_DICT = {
    "Argonne": "Argonne National Laboratory (ANL), Argonne, IL (United States)",
    "Brookhaven": "Brookhaven National Laboratory (BNL), Upton, NY (United States)",
    "Fermilab": "Fermi National Accelerator Laboratory (FNAL), Batavia, IL (United States)",
    "LBL, Berkeley": "Lawrence Berkeley National Laboratory (LBNL), Berkeley, CA (United States)",
    "LLNL, Livermore": "Lawrence Livermore National Laboratory (LLNL), Livermore, CA (United States)",
    "Los Alamos": "Los Alamos National Laboratory (LANL), Los Alamos, NM (United States)",
    "Oak Ridge": "Oak Ridge National Laboratory (ORNL), Oak Ridge, TN (United States)",
    "PNL, Richland": "Pacific Northwest National Laboratory (PNNL), Richland, WA (United States)",
    "Princeton U., Plasma Physics Lab.": "Princeton Plasma Physics Laboratory (PPPL), Princeton, NJ (United States)",
    "SLAC": "SLAC National Accelerator Laboratory (SLAC), Menlo Park, CA (United States)",
    "Sandia": "Sandia National Laboratories (SNL-CA), Livermore, CA (United States)",
    "Sandia, Livermore": "Sandia National Laboratories (SNL-NM), Albuquerque, NM (United States)",
    "Jefferson Lab": "Thomas Jefferson National Accelerator Facility (TJNAF), Newport News, VA (United States)",
}

OSTI_SUBJECT_CATEGORIES_DICT = {
    "acc": "43 PARTICLE ACCELERATORS",
    "ins": "46 INSTRUMENTATION RELATED TO NUCLEAR SCIENCE AND TECHNOLOGY",
    "hep": "72 PHYSICS OF ELEMENTARY PARTICLES AND FIELDS",
    "nucl": "73 NUCLEAR PHYSICS AND RADIATION PHYSICS",
    "astro": "79 ASTRONOMY AND ASTROPHYSICS",
    "math": "97 MATHEMATICS AND COMPUTING",
}

INSPIRE_TO_OSTI_CATEGORIES = {
    "Accelerators": "43 PARTICLE ACCELERATORS",
    "Astrophysics": "79 ASTRONOMY AND ASTROPHYSICS",
    "Data Analysis and Statistics"
    "Experiment-HEP": "72 PHYSICS OF ELEMENTARY PARTICLES AND FIELDS",
    "Experiment-Nucl": "73 NUCLEAR PHYSICS AND RADIATION PHYSICS",
    "Instrumentation": "46 INSTRUMENTATION RELATED TO NUCLEAR SCIENCE AND TECHNOLOGY",
    "Math and Math Physics": "97 MATHEMATICS AND COMPUTING",
    "Phenomenology-HEP": "72 PHYSICS OF ELEMENTARY PARTICLES AND FIELDS",
    "Theory-HEP": "72 PHYSICS OF ELEMENTARY PARTICLES AND FIELDS",
    "Theory-Nucl": "73 NUCLEAR PHYSICS AND RADIATION PHYSICS",
}
