from unittest.mock import MagicMock, patch

import pytest
from include.utils import desy


class FixedDatetime:
    @classmethod
    def now(cls):
        return cls()

    def isoformat(self):
        return "2026-03-23T12:34:56"


@pytest.mark.parametrize(
    ("url", "expected"),
    [
        ("http://example.org/file.pdf", False),
        ("https://example.org/file.pdf", False),
        ("relative/path/file.pdf", True),
        ("/absolute/path/file.pdf", True),
        ("s3://bucket/file.pdf", True),
    ],
)
def test_is_local_path(url, expected):
    assert desy._is_local_path(url) is expected


def test_parse_record_updates_local_documents_and_sets_acquisition_source():
    s3_store = MagicMock()
    s3_store.key_to_s3_url.return_value = "s3://processed/subdir/document.pdf"
    record = {
        "titles": [{"title": "Test"}],
        "documents": [
            {"url": "document.pdf"},
            {"url": "https://example.org/external.pdf"},
        ],
    }

    with patch("include.utils.desy.datetime.datetime", FixedDatetime):
        parsed_record = desy._parse_record(
            record,
            subdirectory_name="subdir/",
            s3_store=s3_store,
            output_bucket="processed-bucket",
            submission_number="12345",
        )

    assert parsed_record["documents"][0]["url"] == "s3://processed/subdir/document.pdf"
    assert parsed_record["documents"][0]["original_url"] == "document.pdf"
    assert parsed_record["documents"][1]["url"] == "https://example.org/external.pdf"
    assert (
        parsed_record["documents"][1]["original_url"]
        == "https://example.org/external.pdf"
    )
    assert parsed_record["acquisition_source"] == {
        "source": "DESY",
        "method": "hepcrawl",
        "datetime": "2026-03-23T12:34:56",
        "submission_number": "12345",
    }
    s3_store.key_to_s3_url.assert_called_once_with(
        "subdir/document.pdf", "processed-bucket"
    )


@patch("include.utils.desy.load_records")
def test_process_subdirectory_filters_invalid_json_moves_files_and_loads_records(
    mock_load_records,
):
    s3_store = MagicMock()
    s3_store.hook.read_key.return_value = """
{"titles": [{"title": "First"}], "documents": [{"url": "local.pdf"}]}
not valid json

{"titles": [{"title": "Second"}], "documents": [{"url": "https://example.org/remote.pdf"}]}
"""
    s3_store.key_to_s3_url.return_value = "s3://processed/subdir/local.pdf"
    workflow_management_hook = MagicMock()
    mock_load_records.return_value = [{"record": "failed"}]

    with patch("include.utils.desy.datetime.datetime", FixedDatetime):
        result = desy.process_subdirectory(
            subdirectory_name="subdir/",
            s3_store=s3_store,
            input_bucket="input-bucket",
            output_bucket="output-bucket",
            workflow_management_hook=workflow_management_hook,
            submission_number="67890",
        )

    assert result == {
        "failed_parse_records": ["not valid json"],
        "failed_load_records": [{"record": "failed"}],
    }

    s3_store.move_all_files_for_subdirectory.assert_called_once_with(
        "subdir/", "input-bucket", "output-bucket"
    )
    mock_load_records.assert_called_once()

    loaded_records, _ = mock_load_records.call_args.args
    assert loaded_records == [
        {
            "titles": [{"title": "First"}],
            "documents": [
                {
                    "url": "s3://processed/subdir/local.pdf",
                    "original_url": "local.pdf",
                }
            ],
            "acquisition_source": {
                "source": "DESY",
                "method": "hepcrawl",
                "datetime": "2026-03-23T12:34:56",
                "submission_number": "67890",
            },
        },
        {
            "titles": [{"title": "Second"}],
            "documents": [
                {
                    "url": "https://example.org/remote.pdf",
                    "original_url": "https://example.org/remote.pdf",
                }
            ],
            "acquisition_source": {
                "source": "DESY",
                "method": "hepcrawl",
                "datetime": "2026-03-23T12:34:56",
                "submission_number": "67890",
            },
        },
    ]
