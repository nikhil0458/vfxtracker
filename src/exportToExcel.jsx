import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const exportToExcel = async (modalData, reportType) => {
  if (!modalData || modalData.length === 0) {
    console.warn("❌ No data available to export!");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Data");

  // ✅ Define the correct order for scene-wise and shot-wise headers
  const sceneOrder = ["scene", "departments", "status"];
  const shotOrder = ["shot", "department", "status"];

  // ✅ Select the correct order based on report type
  const headers = reportType === "scene" ? sceneOrder : shotOrder;

  // ✅ Define worksheet columns in the correct order
  worksheet.columns = headers.map((header) => ({
    header: header.charAt(0).toUpperCase() + header.slice(1), // Capitalize headers
    key: header,
    width: header.length < 20 ? 20 : header.length, // Adjust width
  }));

  // ✅ Style the headers
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = {name:"Calibri", bold: false, size:12, color: { argb: "FFFFFF" } }; // White font
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "4F81BD" }, // Light Blue background
    };
    cell.alignment = { horizontal: "center" };
  });

  // ✅ Insert data rows in the correct column order
  modalData.forEach((row) => {
    worksheet.addRow(headers.map((header) => row[header] || "")); // Ensure correct order
  });

  // ✅ Generate Excel file and download
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), reportType === "scene" ? "Scene_Report.xlsx" : "Shot_Report.xlsx");

  console.log("✅ Excel file exported successfully!");
};

export default exportToExcel;
