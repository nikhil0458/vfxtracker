import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  message,
  Row,
  Col,
  DatePicker,
  notification,
} from "antd";
import { ip_port } from "./Configs";
import dayjs from "dayjs";
import axios from "axios";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Resizable } from "react-resizable";
import "react-resizable/css/styles.css";
import "./DailyReport.css";

const ResizableTitle = (props) => {
  const { onResize, onResizeStop, width, ...restProps } = props;
  if (!width) return <th {...restProps} />;

  return (
    <Resizable
      width={width}
      height={0}
      handle={
        <span
          className="react-resizable-handle"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            right: -5,
            top: 0,
            bottom: 0,
            width: 10,
            cursor: "col-resize",
            ZIndex: 1,
          }}
        />
      }
      // handle = {
      //   <span
      //     className="react-resizable-handle"
      //     onClick={(e) => stopPropagation()}
      //   />
      // }
      onResize={onResize}
      onResizeStop={onResizeStop}
      draggableOpts={{ enableUserSelectHack: false, grid: [1, 1] }}
    >
      <th {...restProps} />
    </Resizable>
  );
};

const DailyReport = () => {
  const [selectedDailyReportDate, setSelectedDailyReportDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tableDailyData, setTableDailyData] = useState([]);
  const [tableDailyColumns, setTableDailyColumns] = useState([]);
  const [isDailyReportVisible, setIsDailyReportVisible] = useState(false);

  const [filterOfFilterDailyReportData, isfilterOfFilterDailyReportData] =
    useState([]);

  useEffect(() => {
    const storedSelectedDailyReportDate = localStorage.getItem(
      "selectedDailyReportDateInStorage"
    );
    const storedDailyReportData = localStorage.getItem("tableDailyReportData");
    const storedDailyReportColumns = localStorage.getItem(
      "tableDailyReportColumns"
    );
    const storedIsDailyReportVisible = localStorage.getItem(
      "isDailyReportVisible"
    );

    if (storedSelectedDailyReportDate) {
      setSelectedDailyReportDate(storedSelectedDailyReportDate);
    }

    if (storedDailyReportData && storedDailyReportColumns) {
      try {
        let parsedDailyReportData = JSON.parse(storedDailyReportData);

        parsedDailyReportData = parsedDailyReportData.map((item) => ({
          ...item,
          tasks_list: Array.isArray(item.tasks_list)
            ? item.tasks_list.join(" , ")
            : item.tasks_list,
        }));
        const parsedDailyReportColumns = JSON.parse(storedDailyReportColumns);

        if (
          Array.isArray(parsedDailyReportData) &&
          Array.isArray(parsedDailyReportColumns) &&
          parsedDailyReportData.length > 0
        ) {
          setTableDailyData(parsedDailyReportData);
          setTableDailyColumns(parsedDailyReportColumns);
          setIsDailyReportVisible(storedIsDailyReportVisible === "true");
        }
      } catch (error) {
        console.error("Error parsing table data from localStorage:", error);
      }
    }
  }, []);

  const generateFilters = (data, key) => {
    const uniqueValues = [...new Set(data.map((item) => item[key]))];
    return uniqueValues.map((value) => ({ text: value, value }));
  };

  const handleDateChange = (date, dateString) => {
    setSelectedDailyReportDate(dateString);
    localStorage.setItem("selectedDailyReportDateInStorage", dateString);
    setTableDailyData([]);
    setTableDailyColumns([]);
    setIsDailyReportVisible(false);
  };
  const handleShowDailyReport = async () => {
    if (!selectedDailyReportDate) {
      message.warning("Please select a date.");
      // notification.error({description:"Please select a date."})
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(
        `http://${ip_port}/daily_report/?date=${selectedDailyReportDate}`
      );
      console.log("datedaily", selectedDailyReportDate);
      const dailyData = response.data;
      console.log("dailyData", dailyData);

      if (dailyData.length > 0) {
        const formattedDailyData = dailyData.map((item) => ({
          ...item,
          tasks_list: Array.isArray(item.tasks_list)
            ? item.tasks_list.join(" , ")
            : item.tasks_list,
        }));

        const requiredColumns = [
          "date",
          "emp_id",
          "emp_name",
          "department",
          "work",
          "break_time",
          "idle",
          "login_time",
          "logout_time",
          "count",
          "tasks_list",
        ];
        const columns = requiredColumns.map((key, index) => ({
          title: key.replace(/_/g, " ").toUpperCase(),
          dataIndex: key,
          key: key,

          render: (text) => {
            if (key === "tasks_list" && Array.isArray(text)) {
              return text.join("  ,  ");
            }
            return text;
          },
          fixed: index < 3,

          filters: generateFilters(dailyData, key),
          // filters: [
          //   ...Array.from(
          //     new Set(requiredColumns.map((item) => item[key]))
          //   ).map((value) => ({
          //     text: value,
          //     value: value,
          //   })),
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

        const prevData =
          JSON.parse(localStorage.getItem("tableDailyReportData")) || [];

        setTableDailyData(formattedDailyData);
        setTableDailyColumns(columns);

        isfilterOfFilterDailyReportData(formattedDailyData);
        setIsDailyReportVisible(true);

        localStorage.setItem(
          "tableDailyReportData",
          JSON.stringify(formattedDailyData)
        );
        localStorage.setItem(
          "tableDailyReportColumns",
          JSON.stringify(columns)
        );
        localStorage.setItem("isDailyReportVisible", "true");

        if (JSON.stringify(tableDailyData) !== JSON.stringify(prevData)) {
          message.success("New data fetched for the selected date.");
          // notification.success({description:"New data fetched for the selected date."})
        }
      } else {
        setTableDailyColumns([]);
        setTableDailyData([]);
        setIsDailyReportVisible(false);
        localStorage.setItem("isDailyReportVisible", "false");
        message.info("No data available for the selected date.");
        // notification.info({description:"No data available for the selected date."})
      }
    } catch (error) {
      console.error("Error fetching daily report:", error);
      message.error("Failed to fetch report data.");
      // notification.error({description:"Failed to fetch report data."})
    } finally {
      setLoading(false);
    }
  };

  const handleDailyReportDownload = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("DailyReportData");

    const headerRow = worksheet.addRow(Object.keys(tableDailyData[0]));
    headerRow.height = 20;
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

    tableDailyData.forEach((item) => {
      worksheet.addRow(Object.values(item));
    });

    worksheet.columns.forEach((column) => {
      column.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "DailyReport.xlsx");
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

  const handleResize =
    (index) =>
    (e, { size }) => {
      setTableDailyColumns((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          width: size.width,
        };
        return next;
      });
    };

  const handleResizeStop =
    (index) =>
    (e, { size }) => {
      setTableDailyColumns((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          width: size.width,
        };
        localStorage.setItem("tableDailyReportColumns", JSON.stringify(next));
        return next;
      });
    };

  const enhancedDailyReportColumns = tableDailyColumns.map((col, index) => ({
    ...col,
    sorter: (a, b) => (a[col.dataIndex] > b[col.dataIndex] ? 1 : -1),
    sortOrder:
      tableParams.sorter?.columnKey === col.dataIndex
        ? tableParams.sorter.order
        : null,

    // filters: [
    //   ...new Set(tableDailyData.map((item) => item[col.dataIndex])),
    // ].map((value) => ({
    //   text: value,
    //   value,
    // })),

    filters: generateFilters(
      filterOfFilterDailyReportData.length > 0
        ? filterOfFilterDailyReportData
        : tableDailyData,
      col.dataIndex
    ),

    filteredValue: tableParams.filters?.[col.dataIndex] || null,
    onFilter: (value, record) => record[col.dataIndex] === value,
    // width:150,
    width: col.width || 150,
    onHeaderCell: (column) => ({
      width: column.width,
      onResize: handleResize(index),
      onResizeStop: handleResizeStop(index),
    }),
  }));

  const handleTableChange = (pagination, filters, sorter, extra) => {
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
    });

    isfilterOfFilterDailyReportData(extra.currentDataSource || tableDailyData);
    // localStorage.setItem("dailyReportTableState", JSON.stringify(newState));
  };

  return (
    <>
      <div style={{ padding: 24 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <label style={{ marginRight: 8 }}> Select Date: </label>
            <DatePicker
              onChange={handleDateChange}
              value={
                selectedDailyReportDate ? dayjs(selectedDailyReportDate) : null
              }
              format="YYYY-MM-DD"
              allowClear
            />
          </div>

          <Button
            onClick={() => handleShowDailyReport(selectedDailyReportDate)}
            type="primary"
            disabled={!selectedDailyReportDate}
            style={{ marginLeft: "8px" }}
          >
            show Report
          </Button>

          {isDailyReportVisible && (
            <Button
              style={{ marginLeft: 18 }}
              type="primary"
              disabled={!selectedDailyReportDate}
              onClick={handleDailyReportDownload}
            >
              Export Excel
            </Button>
          )}
        </div>

        {isDailyReportVisible && (
          <Table
            bordered
            components={{
              header: { cell: ResizableTitle },
            }}
            className="custom-table"
            dataSource={tableDailyData}
            style={{ marginTop: "30px", width: "100%" }}
            columns={enhancedDailyReportColumns}
            rowKey={(record) =>
              record.emp_id || record.id || JSON.stringify(record)
            }
            // pagination={tableParams.pagination}
            pagination={false}
            // scroll={{ x: "max-content", y: 400 }}
            scroll={{ x: "max-content", y: "calc(100vh - 340px)" }}
            sticky={{ offsetHeader: 0 }}
            onChange={handleTableChange}
            // filteredValue={tableParams.filters}
            // sortOrder={tableParams.sorter?.order}
            // sortedInfo={tableParams.sorter}
            // sticky
          />
        )}
      </div>
    </>
  );
};

export default DailyReport;
