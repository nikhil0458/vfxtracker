import ExcelJS from "exceljs";
import {saveAs} from "file-saver";

const handleDownload = async (dynamicColumns, jsonData) => {
    

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data");

    const headers = dynamicColumns.map((col) => col.title);
    worksheet.addRow(headers);

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = {
        name: "Calibri",
        bold: false,
        size: 12,
        color: { argb: "FFFFFF" },
      };

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4F81BD" },
      };
      cell.alignment = { horizontal: "left", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    jsonData.forEach((item) => {
      const rowValues = dynamicColumns.map((col) => item[col.dataIndex] || "");
      worksheet.addRow(rowValues);
    });

    worksheet.columns.forEach((column) => {
      column.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "Reports.xlsx");
  };
export default handleDownload;