from include.utils.elsevier import extract_package_entries


class TestElsevierUtils:
    def test_extract_package_entries(self):
        feed_xml = """
        <feed xmlns="http://www.w3.org/2005/Atom">
            <entry>
                <title> package-a.zip </title>
                <link href="https://example.org/package-a.zip" />
            </entry>
            <entry>
                <title>package-b.zip</title>
                <link href="https://example.org/package-b.zip" />
            </entry>
        </feed>
        """

        assert extract_package_entries(feed_xml) == [
            {"name": "package-a.zip", "url": "https://example.org/package-a.zip"},
            {"name": "package-b.zip", "url": "https://example.org/package-b.zip"},
        ]

    def test_extract_package_entries_skips_missing_title_or_link_href(self):
        feed_xml = """
        <feed xmlns="http://www.w3.org/2005/Atom">
            <entry>
                <title>valid.zip</title>
                <link href="https://example.org/valid.zip" />
            </entry>
            <entry>
                <title>missing-href.zip</title>
                <link />
            </entry>
            <entry>
                <link href="https://example.org/missing-title.zip" />
            </entry>
            <entry>
                <title>missing-link.zip</title>
            </entry>
        </feed>
        """

        assert extract_package_entries(feed_xml) == [
            {"name": "valid.zip", "url": "https://example.org/valid.zip"}
        ]
