"use client";

import { type PDFData, generatePDF } from "@/lib/pdf";
import { Button, IconButton } from "@once-ui-system/core";

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
