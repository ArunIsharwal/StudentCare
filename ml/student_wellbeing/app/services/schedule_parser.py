"""
schedule_parser.py — Academic Calendar Parser

Parses uploaded CSV/JSON/PDF calendar files into normalized event data
with intensity scoring used downstream by stress_engine.

PDF strategy (in priority order):
  1. pdfplumber table extraction — best for structured "Event | From | To" tables
  2. pdfplumber text extraction + regex — for text-based unstructured PDFs
  3. OCR (easyocr) — fallback for image-based / scanned PDFs
"""

import csv
import json
import io
import re
import logging
from datetime import datetime
from typing import Optional

import pdfplumber

logger = logging.getLogger(__name__)

# ── Event Type → Intensity Mapping ───────────────────────────────────────────

INTENSITY_MAP = {
    "exam":     "high",
    "deadline": "medium",
    "lab":      "medium",
    "event":    "low",
    "holiday":  "low",
    "general":  "low",
}

# ── Keywords for Auto-Classification ─────────────────────────────────────────

EVENT_KEYWORDS = {
    "exam":     ["exam", "midsem", "endsem", "mid-sem", "end-sem",
                 "midterm", "final", "test", "quiz", "viva",
                 "mid term", "end term", "examination"],
    "deadline": ["deadline", "submission", "assignment", "project",
                 "report", "registration", "last date", "pre-registration"],
    "lab":      ["lab", "practical", "workshop", "tutorial"],
    "event":    ["fest", "festival", "cultural", "sports", "seminar",
                 "orientation", "convocation", "inauguration",
                 "techno-cultural", "flairfiesta", "flairfiest",
                 "commencement"],
    "holiday":  ["holiday", "vacation", "break", "recess", "off", "gazetted",
                 "makar", "republic", "holi", "diwali", "christmas",
                 "independence", "gandhi", "navami", "jayanti",
                 "purnima", "muharram", "id-ul", "eid", "good friday",
                 "summer vacation"],
}

# ── Date Regex Patterns (for fallback text extraction) ───────────────────────

DATE_PATTERNS = [
    r"\d{4}-\d{2}-\d{2}",                                                         # YYYY-MM-DD
    r"\d{1,2}[/-]\d{1,2}[/-]\d{2,4}",                                             # DD/MM/YYYY
    r"(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s*"
    r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}\s*,?\s*\d{2,4}",  # Thursday, January 01, 2026
    r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s*\d{2,4}",  # Apr 20, 2026
    r"\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{2,4}",    # 20 April 2026
]

DATE_RANGE_PATTERN = re.compile(
    r"(" + "|".join(DATE_PATTERNS) + r")"
    r"\s*(?:[-–—]|to)\s*"
    r"(" + "|".join(DATE_PATTERNS) + r")",
    re.IGNORECASE,
)

SINGLE_DATE_PATTERN = re.compile(
    r"(" + "|".join(DATE_PATTERNS) + r")",
    re.IGNORECASE,
)

# ── Supported Date Formats for Normalization ─────────────────────────────────

_DATE_FORMATS = [
    "%Y-%m-%d",                  # 2026-04-20
    "%d/%m/%Y",                  # 20/04/2026
    "%d-%m-%Y",                  # 20-04-2026
    "%d/%m/%y",                  # 20/04/26
    "%d-%m-%y",                  # 20-04-26
    "%B %d, %Y",                 # April 20, 2026
    "%B %d %Y",                  # April 20 2026
    "%b %d, %Y",                 # Apr 20, 2026
    "%b %d %Y",                  # Apr 20 2026
    "%b. %d, %Y",                # Apr. 20, 2026
    "%b. %d %Y",                 # Apr. 20 2026
    "%d %B %Y",                  # 20 April 2026
    "%d %b %Y",                  # 20 Apr 2026
    "%d %b. %Y",                 # 20 Apr. 2026
    "%A, %B %d, %Y",             # Thursday, January 01, 2026
    "%A, %b %d, %Y",             # Thursday, Jan 01, 2026
    "%a, %B %d, %Y",             # Thu, January 01, 2026
    "%B %d",                     # January 01  (year inferred later)
    "%b %d",                     # Jan 01
]

# Header keywords to detect and skip table header rows
_HEADER_KEYWORDS = [
    "event", "from", "to", "date", "activity", "description", "s.no", "sr",
    "sl.no", "sl no", "serial", "start", "end", "duration", "details",
]


# ══════════════════════════════════════════════════════════════════════════════
#  DATE HELPERS
# ══════════════════════════════════════════════════════════════════════════════

def _normalize_date_string(raw_date: str) -> Optional[str]:
    """
    Parse a raw date string into YYYY-MM-DD.
    Handles "Thursday, January 01, 2026", "Apr 20, 2026", "20/04/2026", etc.
    Returns None if no format matches.
    """
    if not raw_date or not raw_date.strip():
        return None

    # Basic cleanup
    cleaned = raw_date.strip()
    cleaned = re.sub(r"\s+", " ", cleaned)          # collapse multiple spaces
    cleaned = re.sub(r",\s*,", ",", cleaned)         # double commas
    # Fix OCR artifacts like "May 04,.2026" → "May 04, 2026"
    cleaned = re.sub(r"\.,\s*", ", ", cleaned)
    cleaned = re.sub(r",\.+", ",", cleaned)
    # Fix missing space after comma before year: "March 10,2026" → "March 10, 2026"
    cleaned = re.sub(r",(\d{4})", r", \1", cleaned)
    # Fix extra space before comma: "May 27 ,2026" → "May 27, 2026"
    cleaned = re.sub(r"\s+,", ",", cleaned)
    # Fix extra dots: "Friday,_ June 26, 2026" → "Friday, June 26, 2026"
    cleaned = cleaned.replace("_", " ")
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    for fmt in _DATE_FORMATS:
        try:
            dt = datetime.strptime(cleaned, fmt)
            # If year not in format string, default to current year
            if "%Y" not in fmt and "%y" not in fmt:
                dt = dt.replace(year=datetime.now().year)
            return dt.strftime("%Y-%m-%d")
        except ValueError:
            continue

    # Second pass: strip leading day-name if present ("Thursday, ..." → "...")
    stripped = re.sub(
        r"^(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)"
        r"[,\s]*",
        "", cleaned, flags=re.IGNORECASE,
    )
    if stripped != cleaned:
        for fmt in _DATE_FORMATS:
            try:
                dt = datetime.strptime(stripped, fmt)
                if "%Y" not in fmt and "%y" not in fmt:
                    dt = dt.replace(year=datetime.now().year)
                return dt.strftime("%Y-%m-%d")
            except ValueError:
                continue

    logger.warning("[Calendar] Could not normalize date: '%s'", raw_date)
    return None


# ══════════════════════════════════════════════════════════════════════════════
#  EVENT CLASSIFICATION
# ══════════════════════════════════════════════════════════════════════════════

def _classify_event_type(event_name: str) -> str:
    """
    Infer event_type from event name using keyword matching.

    Priority order: exam → lab → deadline → event → holiday → general
    """
    name_lower = event_name.lower()

    for event_type, keywords in EVENT_KEYWORDS.items():
        for keyword in keywords:
            if keyword in name_lower:
                return event_type

    return "general"


# ══════════════════════════════════════════════════════════════════════════════
#  PUBLIC API
# ══════════════════════════════════════════════════════════════════════════════

def parse_calendar(file_bytes: bytes, filename: str) -> list:
    """
    Parse an uploaded calendar file (CSV, JSON, or PDF) into normalized event list.

    - CSV:  expects columns event_name, start_date, end_date, event_type
    - JSON: list of objects with same keys
    - PDF:  table extraction (pdfplumber) → text regex → OCR fallback

    Returns:
        [
          {
            "event":      "Midsem Examination",
            "type":       "exam",
            "start_date": "2026-04-20",
            "end_date":   "2026-04-25",
            "intensity":  "high"
          }, ...
        ]
    """
    try:
        lower = filename.lower()
        if lower.endswith(".csv"):
            return _parse_csv(file_bytes)
        elif lower.endswith(".json"):
            return _parse_json(file_bytes)
        elif lower.endswith(".pdf"):
            return _parse_pdf(file_bytes)
        else:
            logger.error(
                "[Calendar] Unsupported file format: %s. "
                "Supported formats: CSV, JSON, PDF.", filename,
            )
            return []
    except Exception as e:
        logger.error("[Calendar] Failed to parse file '%s': %s", filename, e)
        return []


# ══════════════════════════════════════════════════════════════════════════════
#  CSV PARSER
# ══════════════════════════════════════════════════════════════════════════════

def _parse_csv(file_bytes: bytes) -> list:
    """Parse CSV calendar file."""
    text = file_bytes.decode("utf-8")
    reader = csv.DictReader(io.StringIO(text))
    events = []

    for row in reader:
        event = _normalize_event(row)
        if event:
            events.append(event)

    logger.info("[Calendar] Parsed %d events from CSV.", len(events))
    return events


# ══════════════════════════════════════════════════════════════════════════════
#  JSON PARSER
# ══════════════════════════════════════════════════════════════════════════════

def _parse_json(file_bytes: bytes) -> list:
    """Parse JSON calendar file."""
    data = json.loads(file_bytes.decode("utf-8"))

    if not isinstance(data, list):
        logger.error("[Calendar] JSON must be a list of event objects.")
        return []

    events = []
    for item in data:
        event = _normalize_event(item)
        if event:
            events.append(event)

    logger.info("[Calendar] Parsed %d events from JSON.", len(events))
    return events


# ══════════════════════════════════════════════════════════════════════════════
#  PDF PARSER  (pdfplumber table → text regex → OCR fallback)
# ══════════════════════════════════════════════════════════════════════════════

def _parse_pdf(file_bytes: bytes) -> list:
    """
    Parse a PDF academic calendar.

    Strategy:
      1. Open with pdfplumber
      2. Try table extraction (page.extract_table) on every page
      3. If tables found → parse rows as [event, from_date, to_date, ...]
      4. If no tables → try regex text extraction from pdfplumber text
      5. If no text at all (image-based PDF) → OCR with easyocr
      6. Return structured event list or empty list
    """

    # ── Step 1: Open PDF ──────────────────────────────────────────────────
    try:
        pdf = pdfplumber.open(io.BytesIO(file_bytes))
    except Exception as e:
        logger.error(
            "[Calendar] Failed to open PDF: %s. "
            "Could not extract structured data. Please upload CSV instead.", e,
        )
        return []

    # ── Step 2: Check if PDF has any text at all ──────────────────────────
    has_text = False
    for page in pdf.pages:
        if page.chars:  # chars list is non-empty = real text layer
            has_text = True
            break

    if has_text:
        # ── Step 3: Table Extraction (primary) ────────────────────────────
        events = _extract_from_tables(pdf)
        if events:
            logger.info(
                "[Calendar] Table extraction successful — %d events from PDF.",
                len(events),
            )
            pdf.close()
            return events

        logger.info("[Calendar] No tables found — falling back to regex extraction.")

        # ── Step 4: Regex Text Fallback ───────────────────────────────────
        events = _extract_from_text_regex(pdf)
        pdf.close()

        if events:
            logger.info("[Calendar] Regex extraction found %d events from PDF.", len(events))
        else:
            logger.warning(
                "[Calendar] Could not extract structured data from text PDF. "
                "Please upload CSV for reliable parsing.",
            )
        return events

    # ── Step 5: Image-based PDF → OCR ─────────────────────────────────────
    pdf.close()
    logger.info(
        "[Calendar] PDF has no text layer (image-based/scanned). "
        "Attempting OCR extraction..."
    )
    return _extract_from_ocr(file_bytes)


# ──────────────────────────────────────────────────────────────────────────────
#  PDF — TABLE EXTRACTION  (pdfplumber)
# ──────────────────────────────────────────────────────────────────────────────

def _extract_from_tables(pdf) -> list:
    """
    Extract events from PDF tables using pdfplumber.

    Expected table formats:
      - [Event, From, To]
      - [S.No, Event, From, To]
      - [Event, Date]          (single-date rows)

    Automatically detects column mapping by scanning the header row.
    """
    events = []
    seen = set()

    for page_idx, page in enumerate(pdf.pages):
        tables = page.extract_tables()

        if not tables:
            logger.debug("[Calendar] Page %d: no tables found.", page_idx + 1)
            continue

        for table_idx, table in enumerate(tables):
            if not table or len(table) < 2:  # need at least header + 1 row
                continue

            logger.debug(
                "[Calendar] Page %d, Table %d: %d rows extracted.",
                page_idx + 1, table_idx + 1, len(table),
            )

            # Detect column mapping from header
            col_map = _detect_column_mapping(table[0])

            # Process data rows (skip header)
            for row_idx, row in enumerate(table[1:], start=2):
                if not row or all(not cell or not str(cell).strip() for cell in row):
                    continue  # skip empty rows

                # Skip rows that look like sub-headers
                first_cell = str(row[0]).strip().lower() if row[0] else ""
                if any(kw in first_cell for kw in _HEADER_KEYWORDS):
                    logger.debug("[Calendar] Skipping sub-header row %d: %s", row_idx, row)
                    continue

                parsed = _parse_table_row(row, col_map)
                if not parsed:
                    logger.debug("[Calendar] Skipping unparseable row %d: %s", row_idx, row)
                    continue

                # Deduplicate
                dedup_key = (parsed["event"].lower(), parsed["start_date"])
                if dedup_key in seen:
                    continue
                seen.add(dedup_key)

                events.append(parsed)
                logger.debug("[Calendar] Table event: %s", parsed)

    return events


def _detect_column_mapping(header_row: list) -> dict:
    """
    Detect which columns contain event name, start date, and end date
    by inspecting the header row text.

    Returns dict with keys: 'event_col', 'from_col', 'to_col'
    (-1 if not found).
    """
    col_map = {"event_col": -1, "from_col": -1, "to_col": -1}

    if not header_row:
        # No header — assume [event, from, to] or [sno, event, from, to]
        if len(header_row) >= 4:
            return {"event_col": 1, "from_col": 2, "to_col": 3}
        return {"event_col": 0, "from_col": 1, "to_col": 2}

    for i, cell in enumerate(header_row):
        if not cell:
            continue
        cell_lower = str(cell).strip().lower()

        if any(kw in cell_lower for kw in ["event", "activity", "description", "detail"]):
            col_map["event_col"] = i
        elif any(kw in cell_lower for kw in ["from", "start", "begin"]):
            col_map["from_col"] = i
        elif any(kw in cell_lower for kw in ["to", "end", "till", "until"]):
            col_map["to_col"] = i
        elif "date" in cell_lower and col_map["from_col"] == -1:
            col_map["from_col"] = i

    # Fallback heuristics if header didn't have recognisable keywords
    if col_map["event_col"] == -1:
        # If first column looks like S.No, event is column 1; else column 0
        first = str(header_row[0]).strip().lower() if header_row[0] else ""
        if any(kw in first for kw in ["s.no", "sr", "sl", "no", "#"]):
            col_map["event_col"] = 1
        else:
            col_map["event_col"] = 0

    if col_map["from_col"] == -1:
        col_map["from_col"] = col_map["event_col"] + 1

    if col_map["to_col"] == -1 and len(header_row) > col_map["from_col"] + 1:
        col_map["to_col"] = col_map["from_col"] + 1

    logger.debug("[Calendar] Column mapping: %s (from header: %s)", col_map, header_row)
    return col_map


def _parse_table_row(row: list, col_map: dict) -> Optional[dict]:
    """
    Parse a single table row into a structured event dict.
    Returns None if critical data is missing or unparseable.
    """
    def _safe_get(idx):
        if 0 <= idx < len(row) and row[idx]:
            return str(row[idx]).strip()
        return ""

    event_name = _safe_get(col_map["event_col"])
    from_raw   = _safe_get(col_map["from_col"])
    to_raw     = _safe_get(col_map["to_col"])

    if not event_name:
        return None

    # Parse dates
    start_date = _normalize_date_string(from_raw) if from_raw else None
    end_date   = _normalize_date_string(to_raw)   if to_raw   else None

    # If neither column yielded a date, try extracting from event name text
    if not start_date:
        start_date, end_date = _extract_dates_from_line(event_name)

    if not start_date:
        # Try combining all remaining cells for date extraction
        all_text = " ".join(str(c).strip() for c in row if c)
        start_date, end_date = _extract_dates_from_line(all_text)

    if not start_date:
        return None

    if not end_date:
        end_date = start_date

    # Classify event type
    event_type = _classify_event_type(event_name)
    intensity  = INTENSITY_MAP.get(event_type, "low")

    # Clean up event name (remove leading serial numbers like "1.", "1)", etc.)
    event_name = re.sub(r"^\d+[.)]\s*", "", event_name).strip()

    return {
        "event":      event_name,
        "type":       event_type,
        "start_date": start_date,
        "end_date":   end_date,
        "intensity":  intensity,
    }


# ──────────────────────────────────────────────────────────────────────────────
#  PDF — REGEX TEXT FALLBACK
# ──────────────────────────────────────────────────────────────────────────────

def _extract_from_text_regex(pdf) -> list:
    """
    Fallback: extract full text from PDF and find events via keyword + date regex.
    """
    full_text = ""
    for page in pdf.pages:
        page_text = page.extract_text()
        if page_text:
            full_text += page_text + "\n"

    if not full_text.strip():
        logger.error(
            "[Calendar] PDF contains no extractable text. "
            "It may be image-based. Please upload a text-based PDF or CSV.",
        )
        return []

    logger.debug("[Calendar] Regex fallback — extracted %d chars from PDF.", len(full_text))
    return _parse_text_for_events(full_text)


# ──────────────────────────────────────────────────────────────────────────────
#  PDF — OCR FALLBACK  (easyocr for image-based PDFs)
# ──────────────────────────────────────────────────────────────────────────────

def _extract_from_ocr(file_bytes: bytes) -> list:
    """
    OCR fallback for image-based PDFs using easyocr.

    Steps:
      1. Convert PDF pages to images via pdfplumber
      2. Run EasyOCR on each page image
      3. Parse the OCR text using the same regex engine used for text PDFs
    """
    try:
        import easyocr
        import numpy as np
    except ImportError:
        logger.error(
            "[Calendar] OCR libraries not available. "
            "Install: pip install easyocr numpy. "
            "Or upload a text-based PDF / CSV instead."
        )
        return []

    # ── Convert PDF pages to images ───────────────────────────────────────
    try:
        images = _pdf_to_images(file_bytes)
    except Exception as e:
        logger.error("[Calendar] Failed to convert PDF pages to images: %s", e)
        return []

    if not images:
        logger.error("[Calendar] No images could be extracted from PDF.")
        return []

    # ── Run OCR ───────────────────────────────────────────────────────────
    logger.info("[Calendar] Running OCR on %d page(s)...", len(images))
    try:
        reader = easyocr.Reader(["en"], gpu=False, verbose=False)
    except Exception as e:
        logger.error("[Calendar] Failed to initialize OCR reader: %s", e)
        return []

    full_text = ""
    for i, img in enumerate(images):
        try:
            img_array = np.array(img)
            # Use detail=1 to get bounding boxes, which helps with structure
            results = reader.readtext(img_array, detail=0, paragraph=True)
            page_text = "\n".join(results)
            logger.debug(
                "[Calendar] OCR Page %d: extracted %d characters.",
                i + 1, len(page_text),
            )
            full_text += page_text + "\n"
        except Exception as e:
            logger.warning("[Calendar] OCR failed on page %d: %s", i + 1, e)
            continue

    if not full_text.strip():
        logger.error("[Calendar] OCR produced no text from the PDF.")
        return []

    logger.info("[Calendar] OCR extracted %d total characters from PDF.", len(full_text))

    # ── Parse OCR text ────────────────────────────────────────────────────
    events = _parse_ocr_text_for_events(full_text)

    if events:
        logger.info("[Calendar] OCR extraction found %d events from PDF.", len(events))
    else:
        logger.warning(
            "[Calendar] OCR could not find structured events. "
            "Please upload CSV for reliable parsing."
        )

    return events


def _pdf_to_images(file_bytes: bytes) -> list:
    """
    Convert PDF pages to PIL Image objects.
    Tries pdf2image (poppler) first, falls back to pdfplumber rendering.
    """
    # Try pdf2image (uses poppler, faster and better quality)
    try:
        from pdf2image import convert_from_bytes
        images = convert_from_bytes(file_bytes, dpi=200)
        logger.debug("[Calendar] Converted PDF to %d images via pdf2image.", len(images))
        return images
    except Exception as e:
        logger.debug("[Calendar] pdf2image failed (%s), trying pdfplumber fallback.", e)

    # Fallback: pdfplumber page rendering
    try:
        pdf = pdfplumber.open(io.BytesIO(file_bytes))
        images = []
        for page in pdf.pages:
            img = page.to_image(resolution=200)
            images.append(img.original)
        pdf.close()
        logger.debug("[Calendar] Converted PDF to %d images via pdfplumber.", len(images))
        return images
    except Exception as e:
        logger.error("[Calendar] pdfplumber image extraction also failed: %s", e)
        raise


def _parse_ocr_text_for_events(ocr_text: str) -> list:
    """
    Parse OCR-extracted text into structured events.

    OCR text from academic calendars often has a specific pattern where
    event names and dates appear on the same or adjacent lines. This parser
    handles both inline and multi-line patterns common in OCR output.
    """
    events = []
    seen = set()
    lines = ocr_text.split("\n")

    # ── Strategy 1: Look for short/medium lines with event keywords + dates ─
    # Skip very long lines (>200 chars) — OCR blobs from dense tables
    for line in lines:
        line = line.strip()
        if not line or len(line) < 5 or len(line) > 200:
            continue

        # Try to find event+date on the same line
        event_name, event_type = _classify_event_from_line(line)
        if not event_name:
            continue

        start_date, end_date = _extract_dates_from_line(line)
        if not start_date:
            continue

        # Clean event name: remove date parts from the name
        clean_name = _clean_event_name(event_name)
        if not clean_name or len(clean_name) < 3 or len(clean_name) > 80:
            continue

        dedup_key = (clean_name.lower(), start_date)
        if dedup_key in seen:
            continue
        seen.add(dedup_key)

        events.append({
            "event":      clean_name,
            "type":       event_type,
            "start_date": start_date,
            "end_date":   end_date or start_date,
            "intensity":  INTENSITY_MAP.get(event_type, "low"),
        })

    # ── Strategy 2: Adjacent-line pattern (event name then date lines) ────
    # Common in the summary tables at bottom of page 2
    # e.g.:
    #   Registration for Even Semester 2025-26
    #   Thursday, January 01, 2026
    #   Monday, January 05, 2026
    adj_events = _extract_events_adjacent_lines(lines)
    for evt in adj_events:
        dedup_key = (evt["event"].lower(), evt["start_date"])
        if dedup_key not in seen:
            seen.add(dedup_key)
            events.append(evt)

    # ── Strategy 3: Holiday list pattern ──────────────────────────────────
    # OCR often merges all holiday names into one line and dates into another
    holiday_events = _extract_holiday_list(lines)
    for evt in holiday_events:
        dedup_key = (evt["event"].lower(), evt["start_date"])
        if dedup_key not in seen:
            seen.add(dedup_key)
            events.append(evt)

    # ── Strategy 4: Contextual multi-line (nearby lines) ──────────────────
    if len(events) < 3:
        ctx_events = _extract_events_contextual(lines)
        for evt in ctx_events:
            dedup_key = (evt["event"].lower(), evt["start_date"])
            if dedup_key not in seen:
                seen.add(dedup_key)
                events.append(evt)

    return events


def _extract_events_adjacent_lines(lines: list) -> list:
    """
    Extract events from adjacent-line patterns common in OCR output.

    Pattern: An event name line (with recognized keyword) followed by
    1-3 date lines immediately after.
    """
    events = []
    i = 0

    while i < len(lines):
        line = lines[i].strip()
        i += 1

        if not line or len(line) < 5 or len(line) > 200:
            continue

        # Check if this line is an event name (has keyword but might not have date)
        event_name, event_type = _classify_event_from_line(line)
        if not event_name:
            continue

        clean_name = _clean_event_name(event_name)
        if not clean_name or len(clean_name) < 3 or len(clean_name) > 80:
            continue

        # Check if this line already has dates
        start_date, end_date = _extract_dates_from_line(line)
        if start_date:
            events.append({
                "event":      clean_name,
                "type":       event_type,
                "start_date": start_date,
                "end_date":   end_date or start_date,
                "intensity":  INTENSITY_MAP.get(event_type, "low"),
            })
            continue

        # Look at next 1-3 lines to collect dates
        collected_dates = []
        lookahead = min(i + 3, len(lines))
        for j in range(i, lookahead):
            next_line = lines[j].strip()
            if not next_line:
                continue
            # If next line is another event, stop looking
            _, next_type = _classify_event_from_line(next_line)
            if next_type and not SINGLE_DATE_PATTERN.search(next_line):
                break
            # Extract all dates from this line
            all_dates = SINGLE_DATE_PATTERN.findall(next_line)
            for d in all_dates:
                nd = _normalize_date_string(d)
                if nd:
                    collected_dates.append(nd)

        if collected_dates:
            start = collected_dates[0]
            end = collected_dates[-1] if len(collected_dates) > 1 else start
            events.append({
                "event":      clean_name,
                "type":       event_type,
                "start_date": start,
                "end_date":   end,
                "intensity":  INTENSITY_MAP.get(event_type, "low"),
                })

    return events


def _extract_holiday_list(lines: list) -> list:
    """
    Extract holidays from the merged holiday list pattern common in OCR.

    OCR often produces something like:
      "Makar Sankaranti Republic Day Holi Id-ul-Fitr Ram Navami ..."
      "Wednesday, January 14,2026 Monday, January 26,2026 ..."
    """
    events = []

    # Known holiday names to search for
    holiday_names = [
        "Makar Sankranti", "Makar Sankaranti",
        "Republic Day",
        "Holi",
        "Id-ul-Fitr", "Eid-ul-Fitr",
        "Ram Navami",
        "Mahavir Jayanti",
        "Good Friday",
        "Buddha Purnima", "Budha Purnima",
        "Independence Day",
        "Janmashtami",
        "Gandhi Jayanti",
        "Dussehra",
        "Diwali",
        "Christmas",
        "Id-ul-Zuha", "Eid-ul-Adha", "Bakrid",
        "Muharram",
        "Milad-un-Nabi",
    ]

    for line in lines:
        # Find lines that contain multiple holiday names
        line_lower = line.lower()
        found_holidays = []
        for name in holiday_names:
            if name.lower() in line_lower:
                found_holidays.append(name)

        if len(found_holidays) < 2:
            continue

        # This line has multiple holidays — look for a companion date line
        # Search nearby lines for a cluster of dates
        line_idx = lines.index(line)
        for j in range(max(0, line_idx - 2), min(len(lines), line_idx + 3)):
            date_line = lines[j].strip()
            all_dates = SINGLE_DATE_PATTERN.findall(date_line)
            if len(all_dates) >= 2:  # multiple dates found
                # Try to match holidays to dates in order
                normalized_dates = []
                for d in all_dates:
                    nd = _normalize_date_string(d)
                    if nd:
                        normalized_dates.append(nd)

                # Pair holidays with dates
                for k, holiday in enumerate(found_holidays):
                    if k < len(normalized_dates):
                        events.append({
                            "event":      holiday,
                            "type":       "holiday",
                            "start_date": normalized_dates[k],
                            "end_date":   normalized_dates[k],
                            "intensity":  "low",
                        })
                break  # Found the date line

    return events


def _clean_event_name(raw_name: str) -> str:
    """
    Clean an event name extracted from OCR text.
    Removes date strings, leading/trailing punctuation, extra spaces.
    """
    # Remove date patterns from the name
    cleaned = SINGLE_DATE_PATTERN.sub("", raw_name)
    # Remove day names
    cleaned = re.sub(
        r"(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s*",
        "", cleaned, flags=re.IGNORECASE,
    )
    # Remove common separators and artifacts
    cleaned = re.sub(r"[-–—]+\s*$", "", cleaned)
    cleaned = re.sub(r"^\s*[-–—]+", "", cleaned)
    # Remove leading serial numbers
    cleaned = re.sub(r"^\d+[.)]\s*", "", cleaned)
    # Clean up whitespace and underscores
    cleaned = cleaned.replace("_", " ")
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    # Remove trailing commas
    cleaned = cleaned.rstrip(",").strip()

    return cleaned


# ──────────────────────────────────────────────────────────────────────────────
#  SHARED TEXT PARSING (used by both regex fallback and OCR)
# ──────────────────────────────────────────────────────────────────────────────

def _parse_text_for_events(full_text: str) -> list:
    """
    Parse text (from pdfplumber or OCR) for events using regex patterns.
    """
    lines = full_text.split("\n")
    events = []
    seen = set()

    # Pass 1: line-by-line keyword + date
    for line in lines:
        line = line.strip()
        if not line or len(line) < 5:
            continue

        event_name, event_type = _classify_event_from_line(line)
        if not event_name:
            continue

        start_date, end_date = _extract_dates_from_line(line)
        if not start_date:
            continue

        dedup_key = (event_name.lower(), start_date)
        if dedup_key in seen:
            continue
        seen.add(dedup_key)

        events.append({
            "event":      event_name,
            "type":       event_type,
            "start_date": start_date,
            "end_date":   end_date or start_date,
            "intensity":  INTENSITY_MAP.get(event_type, "low"),
        })

    # Pass 2: contextual multi-line (event name and date on separate lines)
    if not events:
        events = _extract_events_contextual(lines)

    return events


def _classify_event_from_line(text: str) -> tuple:
    """
    Check if a text line contains an event keyword.
    Returns (event_name, event_type) or (None, None).
    """
    text_lower = text.lower()

    for event_type, keywords in EVENT_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower:
                event_name = text.strip()
                if len(event_name) > 100:
                    event_name = event_name[:100].rsplit(" ", 1)[0] + "..."
                return event_name, event_type

    return None, None


def _extract_dates_from_line(line: str) -> tuple:
    """
    Extract (start_date, end_date) from a text line.
    Tries date range first, then single date.
    Returns YYYY-MM-DD strings or (None, None).
    """
    # Try date range: "Apr 20 - Apr 25"
    range_match = DATE_RANGE_PATTERN.search(line)
    if range_match:
        start_norm = _normalize_date_string(range_match.group(1))
        end_norm   = _normalize_date_string(range_match.group(2))
        if start_norm:
            return start_norm, end_norm or start_norm

    # Try finding two separate dates on the same line
    all_dates = SINGLE_DATE_PATTERN.findall(line)
    if len(all_dates) >= 2:
        d1 = _normalize_date_string(all_dates[0])
        d2 = _normalize_date_string(all_dates[-1])
        if d1 and d2:
            return d1, d2

    # Fallback: single date
    if all_dates:
        date_norm = _normalize_date_string(all_dates[0])
        if date_norm:
            return date_norm, date_norm

    return None, None


def _extract_events_contextual(lines: list) -> list:
    """
    Multi-line contextual extraction.
    Looks for keyword lines and searches nearby lines (±2) for dates.
    """
    events = []
    seen = set()

    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue

        event_name, event_type = _classify_event_from_line(line)
        if not event_name:
            continue

        start_date = None
        end_date = None

        window = lines[max(0, i - 2): i + 3]
        for nearby in window:
            s, e = _extract_dates_from_line(nearby)
            if s:
                start_date = s
                end_date = e or s
                break

        if not start_date:
            continue

        dedup_key = (event_name.lower(), start_date)
        if dedup_key in seen:
            continue
        seen.add(dedup_key)

        events.append({
            "event":      event_name,
            "type":       event_type,
            "start_date": start_date,
            "end_date":   end_date,
            "intensity":  INTENSITY_MAP.get(event_type, "low"),
        })

    if events:
        logger.info("[Calendar] Contextual extraction found %d events.", len(events))

    return events


# ══════════════════════════════════════════════════════════════════════════════
#  SHARED NORMALIZER  (CSV / JSON)
# ══════════════════════════════════════════════════════════════════════════════

def _normalize_event(raw: dict) -> Optional[dict]:
    """
    Normalize a single raw event dict into standard format.
    Returns None if required fields are missing.
    """
    event_name = raw.get("event_name", "").strip()
    event_type = raw.get("event_type", "").strip().lower()
    start_date = raw.get("start_date", "").strip()
    end_date   = raw.get("end_date", "").strip()

    if not event_name or not start_date:
        logger.warning("[Calendar] Skipping event with missing name/date: %s", raw)
        return None

    # Validate date format
    try:
        datetime.strptime(start_date, "%Y-%m-%d")
        if end_date:
            datetime.strptime(end_date, "%Y-%m-%d")
        else:
            end_date = start_date
    except ValueError:
        logger.warning("[Calendar] Invalid date format in event '%s'. Expected YYYY-MM-DD.", event_name)
        return None

    # Default to "general" if type is unrecognized
    if event_type not in INTENSITY_MAP:
        event_type = _classify_event_type(event_name)

    return {
        "event":      event_name,
        "type":       event_type,
        "start_date": start_date,
        "end_date":   end_date,
        "intensity":  INTENSITY_MAP.get(event_type, "low"),
    }


# ══════════════════════════════════════════════════════════════════════════════
#  LEGACY (backward compatibility)
# ══════════════════════════════════════════════════════════════════════════════

def calculate_pressure(exam_dates: list, deadlines: int):
    pressure = 0.0
    recommendations = []
    
    if deadlines > 5:
        pressure += 3.0
        recommendations.append("High number of deadlines. Break them into smaller daily tasks.")
    elif deadlines > 2:
        pressure += 1.5
        recommendations.append("Moderate assignment load. Prioritize tasks by urgency.")
        
    if len(exam_dates) > 0:
        pressure += len(exam_dates) * 1.5
        recommendations.append("Upcoming exams detected. Create a structured revision schedule to avoid cramming.")
        
    return pressure, recommendations
