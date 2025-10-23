import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const handleDownload = async (data, consolidatedData) => {
    const workbook = new ExcelJS.Workbook();
    console.log("exportdata", data);
    const dataSheet = workbook.addWorksheet("Main Data");
    if (data.length > 0) {
      const headerRow = dataSheet.addRow(Object.keys(data[0]));
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

      data.forEach((item) => {
        dataSheet.addRow(Object.values(item));
      });

      dataSheet.columns.forEach((column) => {
        column.width = 20;
      });
    }

    if (consolidatedData) {
      console.log("consolidatedData", consolidatedData);
      const consolidatedSheet = workbook.addWorksheet("Consolidated Data");
      const headerRow = consolidatedSheet.addRow(
        Object.keys(consolidatedData[0])
      );
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

      consolidatedData.forEach((item) => {
        if (item.id === "grand-total") {
          item.id = "";
        }
        consolidatedSheet.addRow(Object.values(item));
      });

      consolidatedSheet.columns.forEach((column) => {
        column.width = 20;
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "GetProjectReports.xlsx");
  };

export default handleDownload;