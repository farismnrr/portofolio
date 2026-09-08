"use client";

import { Button, IconButton } from "@once-ui-system/core";
import { generatePDF, type PDFData } from "@/lib/pdf";

interface SavePDFButtonProps {
  data: PDFData;
  iconOnly?: boolean;
}

export default function SavePDFButton({ data, iconOnly }: SavePDFButtonProps) {
  const handleClick = async () => {
    await generatePDF(data);
  };

  if (iconOnly) {
    return (
      <IconButton
        size="l"
        icon="download"
        variant="secondary"
        tooltip="Save to PDF"
        onClick={handleClick}
      />
    );
  }

  return (
    <Button variant="secondary" size="s" prefixIcon="download" onClick={handleClick}>
      Save to PDF
    </Button>
  );
}
