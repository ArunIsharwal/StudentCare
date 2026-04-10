"""Quick debug script — dump what pdfplumber actually sees in the PDF."""
import sys, glob, os, pdfplumber, io

# Find the most recently downloaded PDF in the user's Downloads folder
downloads = os.path.expanduser("~/Downloads")
pdfs = glob.glob(os.path.join(downloads, "*.pdf"))
if not pdfs:
    print("No PDFs found in Downloads folder")
    sys.exit(1)

# Use most recent
pdf_path = max(pdfs, key=os.path.getmtime)
print(f"Using PDF: {pdf_path}\n")

with pdfplumber.open(pdf_path) as pdf:
    for page_idx, page in enumerate(pdf.pages):
        print(f"{'='*80}")
        print(f"PAGE {page_idx + 1}")
        print(f"{'='*80}")

        # Try tables
        tables = page.extract_tables()
        if tables:
            for t_idx, table in enumerate(tables):
                print(f"\n--- Table {t_idx + 1} ({len(table)} rows) ---")
                for r_idx, row in enumerate(table):
                    print(f"  Row {r_idx}: {row}")
        else:
            print("  [No tables found]")

        # Also dump raw text
        text = page.extract_text()
        print(f"\n--- Raw text (first 2000 chars) ---")
        if text:
            print(text[:2000])
        else:
            print("  [No text extracted]")
        print()
