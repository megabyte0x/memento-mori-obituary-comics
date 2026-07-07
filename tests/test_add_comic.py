import argparse
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


MODULE_PATH = Path(__file__).resolve().parents[1] / "scripts" / "add_comic.py"
SPEC = importlib.util.spec_from_file_location("add_comic", MODULE_PATH)
add_comic = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(add_comic)


def passage(word_count: int) -> str:
    return " ".join(f"word{index}" for index in range(word_count))


class EnrichmentValidationTests(unittest.TestCase):
    def valid_comic(self, word_count: int = 134) -> dict:
        return {
            "slug": "sample",
            "person": "Sample Person",
            "title": "Sample",
            "published_at": "2026-07-07",
            "pages": ["pages/01.jpg"],
            "sources": [{"name": "Primary", "url": "https://example.com/source"}],
            "citation_passage": passage(word_count),
            "page_summaries": ["A factual page summary."],
            "sameAs": ["https://www.wikidata.org/wiki/Q1"],
        }

    def test_accepts_citation_passage_boundaries(self):
        for word_count in (134, 167):
            with self.subTest(word_count=word_count):
                add_comic.validate_enrichment(self.valid_comic(word_count))

    def test_rejects_citation_passage_outside_boundaries(self):
        for word_count in (133, 168):
            with self.subTest(word_count=word_count):
                with self.assertRaisesRegex(SystemExit, "134 to 167 words"):
                    add_comic.validate_enrichment(self.valid_comic(word_count))

    def test_rejects_page_summary_count_mismatch(self):
        comic = self.valid_comic()
        comic["page_summaries"] = []

        with self.assertRaisesRegex(SystemExit, "one page summary per page"):
            add_comic.validate_enrichment(comic)

    def test_rejects_non_https_entity_and_source_urls(self):
        comic = self.valid_comic()
        comic["sameAs"] = ["http://www.wikidata.org/wiki/Q1"]
        comic["sources"] = [{"name": "Primary", "url": "http://example.com/source"}]

        with self.assertRaises(SystemExit) as raised:
            add_comic.validate_enrichment(comic)

        self.assertIn("sameAs must contain absolute HTTPS URLs", str(raised.exception))
        self.assertIn("sources must contain named absolute HTTPS URLs", str(raised.exception))

    def test_load_enrichment_keeps_only_supported_fields(self):
        with tempfile.TemporaryDirectory() as directory:
            metadata_path = Path(directory) / "metadata.json"
            metadata_path.write_text(
                json.dumps(
                    {
                        "citation_passage": passage(134),
                        "page_summaries": ["Page one."],
                        "sameAs": ["https://www.wikidata.org/wiki/Q1"],
                        "title": "Must not override the CLI title",
                    }
                ),
                encoding="utf-8",
            )

            enrichment = add_comic.load_enrichment(str(metadata_path))

        self.assertEqual(
            set(enrichment),
            {"citation_passage", "page_summaries", "sameAs"},
        )

    def test_load_enrichment_reports_invalid_json(self):
        with tempfile.TemporaryDirectory() as directory:
            metadata_path = Path(directory) / "metadata.json"
            metadata_path.write_text("{not json", encoding="utf-8")

            with self.assertRaisesRegex(SystemExit, "invalid enrichment metadata"):
                add_comic.load_enrichment(str(metadata_path))

    def test_invalid_enrichment_preserves_existing_staged_comic(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source_dir = root / "source"
            pages_dir = source_dir / "pages"
            pages_dir.mkdir(parents=True)
            (pages_dir / "01.jpg").write_bytes(b"not-a-real-jpeg")

            metadata_path = root / "metadata.json"
            metadata_path.write_text(
                json.dumps(
                    {
                        "citation_passage": passage(133),
                        "page_summaries": ["Page one."],
                        "sameAs": ["https://www.wikidata.org/wiki/Q1"],
                    }
                ),
                encoding="utf-8",
            )

            comics_dir = root / "comics"
            target_dir = comics_dir / "sample"
            target_dir.mkdir(parents=True)
            marker = target_dir / "keep.txt"
            marker.write_text("preserve me", encoding="utf-8")

            args = argparse.Namespace(
                source_dir=str(source_dir),
                slug="sample",
                person="Sample Person",
                title="Sample",
                years="1900–2000",
                dek="A sample life.",
                event="A documented mortality event.",
                sources="Primary=https://example.com/source",
                published_at="2026-07-07",
                pdf=None,
                contact_sheet=None,
                metadata_json=str(metadata_path),
            )

            with patch.object(add_comic, "COMICS_DIR", comics_dir):
                with self.assertRaisesRegex(SystemExit, "134 to 167 words"):
                    add_comic.build_comic(args, None)

            self.assertEqual(marker.read_text(encoding="utf-8"), "preserve me")


if __name__ == "__main__":
    unittest.main()
