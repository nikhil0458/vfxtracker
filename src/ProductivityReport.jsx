import React, { useState, useEffect } from "react";
import { DatePicker, Button, Table, Row, Col } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { ip_port } from "./Configs";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const ProductivityReport = () => {
  const [fromProductivityDate, setFromProductivityDate] = useState(null);
  const [toProductivityDate, setToProductivityDate] = useState(null);
  const [reportProductivityData, setReportProductivityData] = useState([]);
  const [productivityColumns, setProductivityColumns] = useState([]);
  const [isProductivityReportVisible, setIsProductivityReportVisible] =
    useState(false);

  

  useEffect(() => {
    const storedProductivityFromDate = localStorage.getItem(
      "selectedProductivityFromDate"
    );
    const storedProductivityToDate = localStorage.getItem(
      "selectedProductivityToDate"
    );
    const storedProductivityReportData = localStorage.getItem(
      "productivityReportData"
    );
    const storedProductivityReportColumns = localStorage.getItem(
      "productivityReportColumns"
    );
    const storedProductivityReportVisible = localStorage.getItem(
      "isProductivityReportVisible"
    );

    if (storedProductivityFromDate)
      setFromProductivityDate(storedProductivityFromDate);
    if (storedProductivityToDate)
      setToProductivityDate(storedProductivityToDate);

    if (storedProductivityReportData && storedProductivityReportColumns) {
      try {
        const parsedProductivityReportData = JSON.parse(
          storedProductivityReportData
        );
        const parsedProductivityReportColumns = JSON.parse(
          storedProductivityReportColumns
        );

        if (
          Array.isArray(parsedProductivityReportData) &&
          Array.isArray(parsedProductivityReportColumns) &&
          parsedProductivityReportData.length > 0
        ) {
          setReportProductivityData(parsedProductivityReportData);

          setProductivityColumns(parsedProductivityReportColumns);
          setIsProductivityReportVisible(true);
        }
      } catch (error) {
        console.error("Error parsing table data from localStorage:", error);
      }
    }
  }, []);

  

  const getStoredTableState = () => {
    const storedState = localStorage.getItem("productivityReportTableState");
    return storedState ? JSON.parse(storedState) : {};
  };

  const storedState = getStoredTableState();

  const [tableParams, setTableParams] = useState({
    pagination: storedState.pagination || { pageSize: 10 },
    filters: storedState.filters || {},
    sorter: storedState.sorter || {},
  });
  const enhancedProductivityColumns = productivityColumns.map((col) => ({
    ...col,
    sorter: (a, b) => (a[col.dataIndex] > b[col.dataIndex] ? 1 : -1),
    sortOrder: tableParams.sorter?.columnKey === col.dataIndex ? tableParams.sorter.order : null,
    filters: [...new Set(reportProductivityData.map((item) => item[col.dataIndex]))].map((value) => ({
      text: value,
      value,
    })),
    filteredValue: tableParams.filters?.[col.dataIndex] || null,
    onFilter: (value, record) => record[col.dataIndex] === value,
    width: 150,
  }));


  

  const handleTableChange = (pagination, filters, sorter) => {
  


    const newState = { pagination, filters,  sorter: sorter.columnKey ? sorter : {}, };
    setTableParams(newState);
    localStorage.setItem("productivityReportTableState", JSON.stringify(newState));
  };

 
  const handleShowReport = async () => {
    if (!fromProductivityDate || !toProductivityDate) {
      return;
    }

    try {
      const response = await axios.get(`http://${ip_port}/productivity_rpts/`, {
        params: {
          from_date: fromProductivityDate,
          till_date: toProductivityDate,
        },
      });

      const data = response.data;
      console.log("ProductivityReportData", data);

      if (data.length > 0) {
       
       
        const calculateColumnWidth = (key, data) => {
        
        
          const padding = 40; // Extra padding for better readability
          const maxLength = Math.max(
            ...reportProductivityData.map((item) => (item[key] ? item[key].toString().length : 0)), 
            key.length
          );
        
          // Adjust width dynamically based on text length (10px per character for better spacing)
          let calculatedWidth = maxLength * 10 + padding;
        
          
          return Math.min(Math.max(120, calculatedWidth), 800); 
        
        
      
      };
      


        const dynamicColumns = Object.keys(data[0]).map((key, index) => ({
          title: key.charAt(0).toUpperCase() + key.slice(1),
          dataIndex: key,
          key: key,
          width:calculateColumnWidth(key, data),
          fixed: index < 4,
          filters: [
            ...Array.from(new Set(data.map((item) => item[key]))).map(
              (value) => ({
                text: value,
                value: value,
              })
            ),
          ],
          onFilter: (value, record) => record[key] === value,
          sorter: (a, b) => {
            if (typeof a[key] === "number") {
              return a[key] - b[key];
            } else if (typeof a[key] === "string") {
              return a[key].localeCompare(b[key]);
            }
            return 0;
          },
          
        }));

        setProductivityColumns(dynamicColumns);
        setReportProductivityData(data);
        setIsProductivityReportVisible(true);

        localStorage.setItem("productivityReportData", JSON.stringify(data));
        localStorage.setItem(
          "productivityReportColumns",
          JSON.stringify(dynamicColumns)
        );
        localStorage.setItem("isProductivityReportVisible", true);

        
      } else {
        setProductivityColumns([]);
        setIsProductivityReportVisible(false);
        localStorage.setItem("isProductivityReportVisible", false);
      }
    } catch (error) {
      console.error("Error fetching report data:", error);

      alert(
        "There was an error fetching the report data. Please try again later."
      );
    }
  };

  const handleDateChange = (date, dateString, setDate, key) => {
    if (date) {
      const formattedDate = date ? date.format("YYYY-MM-DD") : null;
      console.log("formatdate", formattedDate);
      setDate(formattedDate);

      localStorage.setItem(key, formattedDate);

      setReportProductivityData([]);
      setProductivityColumns([]);
      setIsProductivityReportVisible(false);

      localStorage.removeItem("productivityReportData");
      localStorage.removeItem("productivityReportColumns");
      localStorage.setItem("isProductivityReportVisible", false);
    }
  };

  const handleDownload = async () => {
    // console.log("reportData", reportData);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data");
    const headers = productivityColumns.map((col) => col.title);
    worksheet.addRow(headers);

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = {
        name: "Calibri",
        bold: true,
        size: 12,
        color: { argb: "FFFFFF" },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4F81BD" },
      };
      cell.alignment = { horizontal: "left", vertical: "middle" };
    });
    reportProductivityData.forEach((item) => {
      const rowValues = productivityColumns.map((col) => item[col.dataIndex] || ""); 
      worksheet.addRow(rowValues);
    });

    worksheet.columns.forEach((column) => {
      column.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "ProductivityReports.xlsx");
  };
  

  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={[16, 16]} align="middle" justify="center">
        <Col>
          <DatePicker
            placeholder="From Date"
            value={fromProductivityDate ? dayjs(fromProductivityDate) : null}
            onChange={(date, dateString) =>
              handleDateChange(
                date,
                dateString,
                setFromProductivityDate,
                "selectedProductivityFromDate"
              )
            }
          />
        </Col>
        <Col>
          <DatePicker
            placeholder="To Date"
            value={toProductivityDate ? dayjs(toProductivityDate) : null}
            onChange={(date, dateString) =>
              handleDateChange(
                date,
                dateString,
                setToProductivityDate,
                "selectedProductivityToDate"
              )
            }
          />
        </Col>
        <Col>
          <Button
          
            type="primary"
            disabled={!fromProductivityDate || !toProductivityDate}
            onClick={handleShowReport}

          >
            Show Report
          </Button>
        </Col>
        {isProductivityReportVisible && (
          <Col>
            <Button
              type="primary"
              disabled={!fromProductivityDate || !toProductivityDate}
              onClick={handleDownload}
            >
              Export Excel

            </Button>
          </Col>
        )}
      </Row>
      <Row style={{ marginTop: "20px" }}>
        {fromProductivityDate &&
        toProductivityDate &&
        reportProductivityData.length > 0 ? (
          

          <Table
            className="custom-table"
            style={{ marginTop: "30px", width: "100%" }}
            columns={enhancedProductivityColumns}
            dataSource={reportProductivityData.map((item, index) => ({
              ...item,
              key: index,
            }))}
         
            scroll={{x:"max-content", y :400}}
            sticky
           
            pagination={tableParams.pagination}
            onChange={handleTableChange}
            filteredValue={tableParams.filters} 
            sortOrder={tableParams.sorter?.order} 
            sortedInfo={tableParams.sorter}
          />
        ) : (
          <div className="Para">
            <p>Select dates and click "Show Report" to view data.</p>
          </div>
        )}
      </Row>
    </div>
  );
};

export default ProductivityReport;
