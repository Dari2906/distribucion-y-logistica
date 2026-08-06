@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
}

/* Custom Print styles to make sure only the remito is printed */
@media print {
  @page {
    size: A4 portrait;
    margin: 8mm;
  }

  body {
    background: white !important;
    color: black !important;
    margin: 0 !important;
    padding: 0 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Hide background elements by default */
  body * {
    visibility: hidden;
  }

  /* Make remito print area and its contents completely visible */
  #remito-print-area,
  #remito-print-area * {
    visibility: visible !important;
  }

  /* Reset print container to top-left of standard printed page */
  #remito-print-area {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    box-shadow: none !important;
    background: white !important;
    color: black !important;
  }

  /* Prevent row splitting across printed pages */
  tr {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
}
