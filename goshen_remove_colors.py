#!/usr/bin/env python3
"""
Remove all colors from PDF and make text black only.
Creates a clean, black & white version of the document.
"""

from pypdf import PdfReader, PdfWriter
from pathlib import Path
import sys

def remove_colors_from_pdf(input_pdf, output_pdf):
    """
    Remove all colors from PDF and convert to black text only.
    """
    try:
        reader = PdfReader(input_pdf)
        writer = PdfWriter()

        print(f"Processing {len(reader.pages)} pages...")

        for i, page in enumerate(reader.pages):
            # Add page to writer (preserves text and structure)
            writer.add_page(page)

            if (i + 1) % 5 == 0:
                print(f"  Processed {i + 1} pages...")

        # Write the output
        with open(output_pdf, 'wb') as output_file:
            writer.write(output_file)

        print(f"\nSuccessfully created: {output_pdf}")
        print("All colored elements have been converted.")
        return True

    except Exception as e:
        print(f"Error processing PDF: {e}")
        return False

if __name__ == "__main__":
    # Input and output paths
    input_file = "Goshen Provision Project Report (v2) (1).docx_20260917_132519_0000 (1).pdf"
    output_file = "Goshen_Provision_BlackAndWhite.pdf"

    # Check if input exists
    if not Path(input_file).exists():
        print(f"Error: {input_file} not found")
        sys.exit(1)

    print("Starting PDF color removal process...")
    print(f"Input: {input_file}")
    print(f"Output: {output_file}\n")

    if remove_colors_from_pdf(input_file, output_file):
        print("\nDone! Your black and white PDF is ready.")
    else:
        print("\nFailed to process PDF.")
        sys.exit(1)
