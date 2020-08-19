import io
import tempfile
from contextlib import contextmanager

from flask import current_app
from fs.opener import fsopen
from inspire_schemas.api import ReferenceBuilder
from inspire_utils.dedupers import dedupe_list_of_dicts
from inspire_utils.helpers import force_list
from inspire_utils.record import get_value


@contextmanager
def local_refextract_kbs_path():
    """Get the path to the temporary refextract kbs from the application config.
    """
    journal_kb_path = current_app.config.get("REFEXTRACT_JOURNAL_KB_PATH")
    with retrieve_uri(journal_kb_path) as temp_journal_kb_path:
        yield {"journals": temp_journal_kb_path}


def map_refextract_to_schema(extracted_references, source=None):
    """Convert refextract output to the schema using the builder."""
    result = []

    for reference in extracted_references:
        rb = ReferenceBuilder()
        mapping = [
            ("author", rb.add_refextract_authors_str),
            ("collaboration", rb.add_collaboration),
            ("doi", rb.add_uid),
            ("hdl", rb.add_uid),
            ("isbn", rb.add_uid),
            ("journal_reference", rb.set_pubnote),
            ("linemarker", rb.set_label),
            ("misc", rb.add_misc),
            ("publisher", rb.set_publisher),
            ("raw_ref", lambda raw_ref: rb.add_raw_reference(raw_ref, source=source)),
            ("reportnumber", rb.add_report_number),
            ("texkey", rb.set_texkey),
            ("title", rb.add_title),
            ("url", rb.add_url),
            ("year", rb.set_year),
        ]

        for field, method in mapping:
            for el in force_list(reference.get(field)):
                if el:
                    method(el)

        if get_value(rb.obj, "reference.urls"):
            rb.obj["reference"]["urls"] = dedupe_list_of_dicts(
                rb.obj["reference"]["urls"]
            )

        result.append(rb.obj)
        result.extend(rb.pop_additional_pubnotes())

    return result


@contextmanager
def retrieve_uri(uri, outdir=None):
    """Retrieves the given uri and stores it in a temporary file."""
    with tempfile.NamedTemporaryFile(
        prefix="inspire", dir=outdir
    ) as local_file, fsopen(uri, mode="rb") as remote_file:
        copy_file(remote_file, local_file)

        local_file.flush()
        yield local_file.name


def copy_file(src_file, dst_file, buffer_size=io.DEFAULT_BUFFER_SIZE):
    """Dummy buffered copy between open files."""
    next_chunk = src_file.read(buffer_size)
    while next_chunk:
        dst_file.write(next_chunk)
        next_chunk = src_file.read(buffer_size)
