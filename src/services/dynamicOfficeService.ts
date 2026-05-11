export const loadXLSX = async () => {
  return await import('xlsx');
};

export const loadPdfTools = async () => {
  const [jsPDFModule, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]);

  return {
    jsPDF: jsPDFModule.default,
    autoTable: autoTableModule.default,
  };
};
