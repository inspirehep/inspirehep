import re

from inspire_schemas.api import LiteratureBuilder
from refextract.documents.pdf import replace_undesirable_characters

re_emptyline = re.compile(r"\n\s*\n", re.UNICODE)
re_hyphens = re.compile(
    r"(\\255|\u02D7|\u0335|\u0336|\u2212|\u2013|\u002D|\uFE63|\uFF0D)", re.UNICODE
)
re_multiple_space = re.compile(r"\s{2,}", re.UNICODE)
re_potential_key = re.compile(r"^(?:\d|[^\w.'-])+$", re.UNICODE)
re_trailing_nonword = re.compile(r"((?:\d|[^\w,.'-])+ )", re.UNICODE)
re_symbols = re.compile(r"[^\w ]", re.UNICODE)


def split_id(word):
    """
    Separate potential aff-ids .
    E.g.: '*12%$' -> ['*', '12' '%', '$']
    """

    aff_ids = []

    symbols = re_symbols.findall(word)
    if symbols:
        aff_ids += symbols
        for rest in re_symbols.split(word):
            if rest:
                aff_ids.append(rest)
    else:
        aff_ids.append(word)
    return aff_ids


def cleanup_affiliations_text(text):
    text_with_replaced_chars = (
        text.replace(",", " , ").replace("\n", " , ").replace(" and ", " , ") + " "
    )
    text_with_trailed_non_word = re_trailing_nonword.sub(
        r" \1", text_with_replaced_chars
    )
    return re_multiple_space.sub(" ", text_with_trailed_non_word)


def add_author_affiliation(affiliations, affiliation_key, author_affiliations):
    if affiliation_key not in list(affiliations):
        return
    author_affiliations.append(affiliations[affiliation_key])
    return affiliation_key


def check_affiliation_key_type(aff_keys, warnings):
    if not aff_keys:
        warnings.append("Found no affiliations (empty line needed)")
        return ""
    if aff_keys[0].isalpha():
        return "alpha"
    if aff_keys[0].isdigit():
        return "digit"
    warnings.append("CAUTION! Using symbols (# and stuff) as aff-IDs.")
    return "symbol"


def create_author_fullname(author_names):
    warnings = []
    fullname = " ".join(author_names)
    if len(author_names) == 1:
        warnings.append("Author without firstname: %s" % fullname)
    return fullname, warnings


def handle_affiliations(
    author_full_name, author_name_list, word_in_processing, affiliations, author_affs
):
    warnings = []
    if author_name_list:
        author_full_name, new_warnings = create_author_fullname(author_name_list)
        warnings.extend(new_warnings)
    added_affiliation = add_author_affiliation(
        affiliations, word_in_processing, author_affs
    )
    if not added_affiliation and not word_in_processing == ",":
        for aff_key in split_id(word_in_processing):
            added_affiliation = add_author_affiliation(
                affiliations, aff_key, author_affs
            )
            if not added_affiliation:
                warnings.append(
                    f"""Unresolved aff-ID or stray footnote symbol. Problematic author and aff-id: {author_full_name} {aff_key}"""
                )

    return author_full_name, added_affiliation, warnings


def parse_authors(text, affiliations):
    """
    Parse author names and convert to Lastname, Firstnames.
    Can be separated by ',', newline or affiliation tag.
    Returns:
    List of tuples: (author_fullname, [author_affiliations])
    List of strings: warnings
    """
    authors = []
    warnings = []

    text = cleanup_affiliations_text(text)

    aff_keys = list(affiliations)
    already_occurred_affiliations = []
    key_type = check_affiliation_key_type(aff_keys, warnings)

    author_names = []
    author_affs = []
    fullname = ""
    list_of_words = text.split(" ")
    for nw, word in enumerate(list_of_words):
        if word in aff_keys or word == "," or re_potential_key.search(word):
            fullname, added_affiliation, new_warnings = handle_affiliations(
                fullname, author_names, word, affiliations, author_affs
            )
            already_occurred_affiliations.append(added_affiliation)
            warnings.extend(new_warnings)
            if fullname:
                author_names = []
        else:
            # (part of) (next) author name:test_create_authors_unused_affiliation, process previous author
            if key_type == "alpha" and word.islower() and word.isalpha():
                three_words = list_of_words[
                    max(nw - 2, 0) : min(nw + 3, len(list_of_words)) - 1
                ]
                warnings.append(
                    f"""Is this part of a name or missing aff-id? "{word}" in {' '.join(three_words)}"""
                )
            if fullname:
                if affiliations and not author_affs:
                    # there should be affiliations
                    warnings.append(
                        f"""Author without affiliation-id. Problematic author: {fullname}"""
                    )
                authors.append((fullname, author_affs))
                author_affs = []
                fullname = ""
            if word:
                author_names.append(word)

    if author_names:
        fullname = " ".join(author_names)
        if len(author_names) == 1:
            warnings.append(f"Author without firstname: {fullname}")
        author_affs = []
    if fullname:
        authors.append((fullname, author_affs))

    unused_affiliations = set(affiliations) - set(already_occurred_affiliations)
    if unused_affiliations:
        warnings.append(f"Unused affiliation-IDs: {list(unused_affiliations)}")

    return authors, warnings


def determine_aff_type_character(char_list):
    """
    Guess whether affiliation are by number, letter or symbols (e.g. dagger).
    Numbers and letters should not be mixed.
    """

    aff_type = None
    for char in char_list:
        if aff_type:
            if aff_type == "alpha":
                if not char.isalpha():
                    return None
            elif aff_type == "digit":
                if not char.isdigit():
                    return None
        else:
            if char.isalpha():
                aff_type = "alpha"
            elif char.isdigit():
                aff_type = "digit"
            else:
                aff_type = "symbol"
                break
    return aff_type


def determine_aff_type(text):
    """
    Guess format for affiliations.
    Return corresponding search pattern.
    """

    line_pattern_single = {
        "alpha": re.compile(r"^([a-z]+)\.*$", re.UNICODE),
        "digit": re.compile(r"^(\d+)\.*$", re.UNICODE),
        "symbol": re.compile(r"^(.)\.*$", re.UNICODE),
    }

    line_pattern_line = {
        "alpha": re.compile(r"^([a-z]+)[ .]+(.*)", re.UNICODE),
        "digit": re.compile(r"^(\d+)[ .]*(.*)", re.UNICODE),
        "symbol": re.compile(r"^(.)[ .]+(.*)", re.UNICODE),
    }

    single_char = []
    first_char = []
    for line in text.split("\n"):
        line = line.strip(" .")
        if len(line) == 1:
            single_char.append(line)
        elif line:
            first_char.append(line[0])

    if single_char:
        aff_type = determine_aff_type_character(single_char)
        if aff_type:
            aff_pattern = line_pattern_single[aff_type]
        else:
            raise ValueError(
                f"""Cannot identify type of affiliation, found IDs: {single_char}"""
            )
    else:
        aff_type = determine_aff_type_character(first_char)
        if aff_type:
            aff_pattern = line_pattern_line[aff_type]
        else:
            raise ValueError(
                f"""Cannot identify type of affiliations, found IDs: {first_char}"""
            )

    return aff_pattern


def parse_affiliations(text):
    """
    Determine how affiliations are formatted.
    Return hash of id:affiliation
    Allowed formats:
    don't mix letters and numbers, lower-case letters only
    1
    CERN, Switzerland
    2
    DESY,
    Germany
    1 CERN, Switzerland
    2DESY, Germany
    a  CERN, Switzerland
    bb DESY, Germany
    *
    CERN, Switzerland
    #
    DESY, Germany
    """

    affiliations = {}
    aff_pattern = determine_aff_type(text)

    aff_id = None
    this_aff = []
    for line in text.split("\n"):
        line = line.strip()
        get_affiliation = aff_pattern.search(line)
        if get_affiliation:
            if len(get_affiliation.groups()) == 2:
                affiliations[get_affiliation.group(1)] = get_affiliation.group(
                    2
                ).strip()
            else:
                if aff_id and this_aff:
                    affiliations[aff_id] = " ".join(this_aff).strip()
                    aff_id = None
                    this_aff = []
                aff_id = get_affiliation.group(1)
        elif aff_id:
            this_aff.append(line)
        elif line:
            raise ValueError("Something is wrong with the affiliation list")
    if aff_id and this_aff:
        affiliations[aff_id] = " ".join(this_aff).strip()

    return affiliations


def create_authors(text):
    """
    Split text in (useful) blocks, sepatated by empty lines.
    1 block: no affiliations
    2 blocks: authors and affiliations
    more blocks: authors grouped by affiliation (not implemented yet)
    Returns:
        dict: with two keys: ``authors`` of the form ``(author_fullname,
        [author_affiliations])`` and ``warnings`` which is a list of strings.
    """

    if not text:
        return {}

    if not isinstance(text, str):
        text = text.decode("utf-8")
    text = text.replace("\r", "")  # Input from the form contains unwanted \r's
    text = re_hyphens.sub("-", text)

    empty_blocks = []
    text_blocks = re_emptyline.split(text)
    for num, block in enumerate(text_blocks):
        if not re.search(r"\w", block):
            empty_blocks.append(num)
    empty_blocks.reverse()
    for num in empty_blocks:
        text_blocks.pop(num)

    if len(text_blocks) == 0:
        authors, warnings = [], []
    elif len(text_blocks) == 1:
        authors, warnings = parse_authors(text_blocks[0], {})
    elif len(text_blocks) == 2:
        affiliations = parse_affiliations(text_blocks[1])
        authors, warnings = parse_authors(text_blocks[0], affiliations)
    else:
        # authors = parse_blocks(text_blocks)
        raise ValueError(
            "Authors grouped by affiliation? - Comming soon." "Or too many empty lines."
        )

    if warnings:
        return {"authors": authors, "warnings": warnings}
    else:
        return {"authors": authors}


def authorlist(text):
    """
    Return an author-structure parsed from text
    and optional additional information.
    """
    builder = LiteratureBuilder()

    text = replace_undesirable_characters(text)
    result = create_authors(text)

    if "authors" in result:
        for fullname, author_affs in result["authors"]:
            builder.add_author(
                builder.make_author(fullname, raw_affiliations=author_affs)
            )
        result["authors"] = builder.record["authors"]
    return result
