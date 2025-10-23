import React, { useState, useEffect } from "react";
import { DatePicker, Button, Table, Row, Col } from "antd";
import axios from "axios";
import { ip_port } from "./Configs";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Resizable } from "react-resizable"; 
import "react-resizable/css/styles.css";

import dayjs from "dayjs";



const ResizableTitle = (props) => {
  const {onResize, onResizeStop, width, ...restProps} = props;
   if (!width) return <th {...restProps} />;

   return(
     <Resizable
       width={width}
       height={0}
       handle={
        <span
          className="react-resizable-handle"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute" ,
            right: -5,
            top:0,
            bottom:0,
            width:10,
            cursor: "col-resize",
            ZIndex: 1,

          }}
          />
       }
       
       onResize={onResize}
       onResizeStop={onResizeStop}
       draggableOpts={{enableUserSelectHack: false, grid: [1,1]}}
       >
        <th {...restProps}/>
       </Resizable>
   )

}



const DoneReport = () => {
  const [fromDoneReportDate, setFromDoneReportDate] = useState(null);
  const [toDoneReportDate, setToDoneReportDate] = useState(null);
  const [doneReportData, setDoneReportData] = useState([]);
  const [doneReportColumns, setDoneReportColumns] = useState([]);
  const [isDoneReportVisible, setIsDoneReportVisible] = useState(false);



const [filterOfFilterDoneReportData, isFilterOfFilterDoneReportData] = useState([]);






  useEffect(() => {
    const storedDoneReportFromDate = localStorage.getItem(
      "selectedDoneReportFromDate"
    );
    const storedDoneReportToDate = localStorage.getItem(
      "selectedDoneReportToDate"
    );

    const storedDoneReportData = localStorage.getItem("doneReportData");
    const storedDoneReportColumns = localStorage.getItem("doneReportColumns");
    const storedIsDoneReportVisible = localStorage.getItem(
      "isDoneReportVisible"
    );

    if (storedDoneReportFromDate) {
      setFromDoneReportDate(storedDoneReportFromDate);
    }

    if (storedDoneReportToDate) {
      setToDoneReportDate(storedDoneReportToDate);
    }

    if (storedDoneReportData && storedDoneReportColumns) {
      try {
        const parsedDoneReportData = JSON.parse(storedDoneReportData);
        const parsedDoneReportColumns = JSON.parse(storedDoneReportColumns);

        if (
          Array.isArray(parsedDoneReportData) &&
          Array.isArray(parsedDoneReportColumns) &&
          parsedDoneReportData.length > 0
        ) {
          setDoneReportData(parsedDoneReportData);
          setDoneReportColumns(parsedDoneReportColumns);
          setIsDoneReportVisible(true);
        }
      } catch (error) {
        console.error(
          "Error parsing done report table data from localStorage:",
          error
        );
      }
    }
  }, []);


const generateFilters = (data, key) => {
  const uniqueValues = [...new Set(data.map((item)=> item[key]))];
  return uniqueValues.map((value) => ({ text : value, value}));
};



  const calculateColumnWidth = (key, data) => {
        
        
    const padding = 40;
    const maxLength = Math.max(
      ...doneReportData.map((item) => (item[key] ? item[key].toString().length : 0)), 
      key.length
    );
  
    // Adjust width dynamically based on text length (10px per character for better spacing)
    let calculatedWidth = maxLength * 10 + padding;
  
    // Ensure minimum and maximum constraints
    return Math.min(Math.max(120, calculatedWidth), 800); 
  
  

};

  const getStoredTableState = () => {
    const storedState = localStorage.getItem("doneReportTableState");
    return storedState ? JSON.parse(storedState) : {};
  };

  const storedState = getStoredTableState();

  const [tableParams, setTableParams] = useState({
    pagination: storedState.pagination || { pageSize: 10 },
    filters: storedState.filters || {},
    sorter: storedState.sorter || {},
  });

 const handleResize=
 (index) => 
 (e, {size}) => {
   setDoneReportColumns((prev)=>{
    const next = [...prev];
    next[index] = {
      ...next[index],
      width:size.width,
    };
    return next;
   });
 };


 const handleResizeStop = 
  (index)=>
  (e, {size}) => {
    setDoneReportColumns((prev ) => {
      const next = [...prev];
      next[index] = {...next[index], width: size.width};
      localStorage.setItem("doneReportColumns", JSON.stringify(next));
      return next;
    })
  }


  const enhancedDoneReportColumns = doneReportColumns.map((col,index) => ({
    ...col,
    sorter: (a, b) => (a[col.dataIndex] > b[col.dataIndex] ? 1 : -1),
    sortOrder:
      tableParams.sorter?.columnKey === col.dataIndex
        ? tableParams.sorter.order
        : null,
    // filters: [
    //   ...new Set(doneReportData.map((item) => item[col.dataIndex])),
    // ].map((value) => ({
    //   text: value,
    //   value,
    // })),

    filters: generateFilters(
       filterOfFilterDoneReportData.length>0 ? filterOfFilterDoneReportData  : doneReportData,
       col.dataIndex
    ),
    filteredValue: tableParams.filters?.[col.dataIndex] || null,
    onFilter: (value, record) => record[col.dataIndex] === value,

    width: col.width || 150,
    onHeaderCell: (column) => ({
      width: column.width,
      onResize: handleResize(index),
      onResizeSop: handleResizeStop(index),
    }),
  }));

  const handleTableChange = (pagination, filters, sorter) => {
    // const newState = {
    //   pagination,
    //   filters,
    //   sorter: sorter.columnKey ? sorter : {},
    // };
    // setTableParams(newState);
    setTableParams({

      pagination,
      filters,
      sorter: sorter.columnKey ? sorter : {},
    })

    isFilterOfFilterDoneReportData(extra.currentDataSource || doneReportData )
    // localStorage.setItem("doneReportTableState", JSON.stringify(newState));
  };

  const handleShowReport = async () => {
    if (!fromDoneReportDate || !toDoneReportDate) {
      return;
    }

    try {
      const response = await axios.get(`http://${ip_port}/done_rpts/`, {
        params: {
          from_date: fromDoneReportDate,
          till_date: toDoneReportDate,
        },
      });

      const data = response.data;
      console.log("DoneReportDataFromAndTo", data);

      if (Array.isArray(data) && data.length > 0) {
        const uniqueKeys = new Set();
        data.forEach((item) => {
          Object.keys(item).forEach((key) => uniqueKeys.add(key));
        });

        console.log("uniquekeys", uniqueKeys);
        const dynamicColumns = Array.from(uniqueKeys).map((key, index) => ({
          title: key.charAt(0).toUpperCase() + key.slice(1),
          dataIndex: key,
          // width:250,
          width:calculateColumnWidth(key, data), 
          key: key,
          filters: generateFilters(data, key),
          fixed: index < 3,

          // filters: [
          //   ...Array.from(new Set(data.map((item) => item[key]))).map(
          //     (value) => ({
          //       text: value,
          //       value: value,
          //     })
          //   ),
          // ],
          filterSearch: true,
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

        setDoneReportColumns(dynamicColumns);
        setDoneReportData(data);
        isFilterOfFilterDoneReportData(data)
        setIsDoneReportVisible(true);
        console.log("dynamiccolumns", dynamicColumns);

        localStorage.setItem("doneReportData", JSON.stringify(data));
        localStorage.setItem(
          "doneReportColumns",
          JSON.stringify(dynamicColumns)
        );
        localStorage.setItem("isDoneReportVisible", true);
      } else {
        alert("No data available for the selected date range.");
       
        setDoneReportColumns([]);
        setIsDoneReportVisible(false);
        localStorage.setItem("isDoneReportVisible", false);
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
      const formattedDoneReportDate = date ? date.format("YYYY-MM-DD") : null;
      console.log("formatdate", formattedDoneReportDate);
      setDate(formattedDoneReportDate);

      localStorage.setItem(key, formattedDoneReportDate);

      setDoneReportData([]);
      setDoneReportColumns([]);
      setIsDoneReportVisible(false);

      localStorage.removeItem("doneReportData");
      localStorage.removeItem("doneReportColumns");
      localStorage.setItem("isDonereportVisible", false);
    }
  };

  const handleDownload = async () => {
    // console.log("reportData", reportData);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data");
    // const headers = columns.map((col) => col.title);
    const headers = doneReportColumns.map((col) => col.title);
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
    doneReportData.forEach((item) => {
      const rowValues = doneReportColumns.map((col) => item[col.dataIndex] || "");
      worksheet.addRow(rowValues);
    });

    worksheet.columns.forEach((column) => {
      column.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "DoneReports.xlsx");
    
  };

  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={[16, 16]} align="middle" justify="center">
        <Col>
          <DatePicker
            placeholder="From Date"
            value={fromDoneReportDate ? dayjs(fromDoneReportDate) : null}
            onChange={(date, dateString) =>
              handleDateChange(
                date,
                dateString,
                setFromDoneReportDate,
                "selectedDoneReportFromDate"
              )
            }
            format="YYYY-MM-DD"
            allowClear
          />
        </Col>
        <Col>
          <DatePicker
            placeholder="To Date"
            value={toDoneReportDate ? dayjs(toDoneReportDate) : null}
            onChange={(date, dateString) =>
              handleDateChange(
                date,
                dateString,
                setToDoneReportDate,
                "selectedDoneReportToDate"
              )
            }
            format="YYYY-MM-DD"
          />
        </Col>
        <Col>
          <Button
            type="primary"
            disabled={!fromDoneReportDate || !toDoneReportDate}
            onClick={handleShowReport}
          >
            Show Report
          </Button>
        </Col>

        {isDoneReportVisible && (
          <Col>
            <Button
              type="primary"
              disabled={!fromDoneReportDate || !toDoneReportDate}
              onClick={handleDownload}
            >
              Export Excel
            </Button>
          </Col>
        )}
      </Row>
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          {doneReportData.length > 0 ? (
            <Table
              bordered
              components={{
                header: {cell: ResizableTitle},
              }}

              className="custom-table"
              columns={enhancedDoneReportColumns}
              dataSource={doneReportData.map((item, index) => ({
                ...item,
                key: index,
              }))}
              // scroll={{ x: "auto" }}
              scroll={{ x:"max-content", y: 400}}
              // pagination={20}

              pagination={false}
              onChange={handleTableChange}

              // filteredValue={tableParams.filters} 
              // sortOrder={tableParams.sorter?.order} 
              // sortedInfo={tableParams.sorter}
            />
          ) : (
            <p style={{ textAlign: "center" }}>
              Select dates and click "Show Report" to view data.
            </p>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default DoneReport;
