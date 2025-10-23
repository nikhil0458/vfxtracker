
import ExcelJS from "exceljs";
import {saveAs} from "file-saver";




const handleExportAll = async (fetchedData) => {
    if (!fetchedData || fetchedData.length === 0) {
      console.error("No data available to export.");
      return;
    }

    const hiddenColumnKey = "mode_logs"; // Column to hide
    const headers = Object.keys(fetchedData[0]).filter(
      (key) => key !== hiddenColumnKey
    ); 
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Filtered Data");

    
    worksheet.columns = headers.map((header) => ({
      header: header.replace(/_/g, " ").toUpperCase(), 
      key: header,
      width: 20, 
    }));

    
    fetchedData.forEach((row) => {
      const rowData = headers.map((key) => row[key] || "");
      worksheet.addRow(rowData);
    });

    
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFF00" },
      };
      cell.font = {
        name: "Calibri",
        size: 12,
        bold: true,
        color: { argb: "000000" },
      };
      cell.alignment = {
        horizontal: "center",
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

   
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "FilteredData.xlsx");
  };
export default handleExportAll;