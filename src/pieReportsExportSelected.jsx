import ExcelJS from 'exceljs';
import {saveAs} from "file-saver";

const Export_to_Excel = (data, fileName) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Selected Sector Data");

    // Get keys from data for headers
    const headers = Object.keys(data[0]);

    // Add headers
    worksheet.columns = headers.map((header) => ({
      header: header.charAt(0).toUpperCase() + header.slice(1),
      key: header,
      width: 20,
    }));

    // Apply styles to headers
    worksheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFF00" },
      };
      cell.font = {
        name: "Calibri",
        bold: true,
        size: 11,
        color: { argb: "000000" }, // Black text
      };
      cell.alignment = { horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Add data rows
    data.forEach((row) => {
      worksheet.addRow(row);
    });

    // Generate Excel file
    workbook.xlsx.writeBuffer().then((buffer) => {
      saveAs(new Blob([buffer]), `${fileName}.xlsx`);
    });
  };
export default Export_to_Excel;  