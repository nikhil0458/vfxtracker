import React, { useState, useEffect, useRef } from "react";
import {
  Dropdown,
  Menu,
  Button,
  Table,
  message,
  Row,
  Col,
  Flex,
  Input,
} from "antd";
import { DownOutlined, SearchOutlined } from "@ant-design/icons";
import { ip_port } from "./Configs";
import { fetchProjectCodes } from "./utils";
import axios from "axios";
import "./ProjectBidSummary.css";

import ExcelJS from "exceljs";

import { saveAs } from "file-saver";

import { Resizable } from "react-resizable";
import "react-resizable/css/styles.css";

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
      onResize={onResize}
      onResizeStop={onResizeStop}
      draggableOpts={{ enableUserSelectHack: false, grid: [1, 1] }}
    >
      <th {...restProps} />
    </Resizable>
  );
};

const ProjectBidSummary = () => {
  const [projectCodes, setProjectCodes] = useState([]);
  const [selectedBidProjectOption, setSelectedBidProjectOption] = useState("");
  const [displayedOption, setDisplayedOption] = useState("");
  const [tableData, setTableData] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isReportVisible, setIsReportVisible] = useState(false);
  const searchInput = useRef(null);

  const [searchText, setSearchText] = useState("");

  const [filterOfFilterBidSumData, isFilterOfFilterBidSumData] = useState([]);

  useEffect(() => {
    const fetchAndSetProjectCodes = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const codes = await fetchProjectCodes(accessToken);
        setProjectCodes(codes);
      } catch (error) {
        message.error("Failed to fetch project codes.");
        console.error(error);
      }
    };

    fetchAndSetProjectCodes();

    const savedSelectedBidProjectOption = localStorage.getItem(
      "selectedBidProjectOption"
    );
    const savedDisplayedOption = localStorage.getItem("displayedOption");
    const savedTableData = localStorage.getItem("tablebidsummaryData");
    const savedTableColumns = localStorage.getItem("tableColumns");
    const savedIsReportVisible = localStorage.getItem("isReportVisible");

    if (savedSelectedBidProjectOption)
      setSelectedBidProjectOption(savedSelectedBidProjectOption);
    if (savedDisplayedOption) setDisplayedOption(savedDisplayedOption);

    if (savedTableData && savedTableColumns) {
      try {
        const parsedData = JSON.parse(savedTableData);
        const parsedColumns = JSON.parse(savedTableColumns);

        if (
          Array.isArray(parsedData) &&
          Array.isArray(parsedColumns) &&
          parsedData.length > 0
        ) {
          setTableData(parsedData);
          setTableColumns(parsedColumns);
          setIsReportVisible(savedIsReportVisible === "true");
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

  // useEffect(() => {
  //   console.log("filtersOffiltersData-length", filterOfFilterBidSumData);

  //   if (filterOfFilterBidSumData.length > 0) {
  //     console.log("filterOfFilterBidSumData", filterOfFilterBidSumData)
  //     const cols = Object.keys(
  //       filterOfFilterBidSumData[0]).map((key) => ({
  //         title: key.charAt(0).toUpperCase() + key.slice(1),
  //         dataIndex: key,
  //         key,
  //         filters: generateFilters(filterOfFilterBidSumData, key),
  //         onFilter: (value, record) => record[key] === value,
  //         sorter: (a, b) => {
  //           if (typeof a[key] === "number") return a[key] - b[key];
  //           if (typeof a[key] === "string") return a[key].localeCompare(b[key]);
  //           return 0;
  //         },
  //         width: 150,
  //       }));

  //     setTableColumns(cols);
  //   }
  // }, [filterOfFilterBidSumData]);

  const fetchReportData = async (projectCode) => {
    try {
      const response = await axios.get(`http://${ip_port}/bid_summary/`, {
        params: { proj: projectCode },
      });

      const data = response.data;

      if (data.length > 0) {
        const totalRows = data.length;

        const columns = Object.keys(data[0]).map((key, index) => ({
          title: key.charAt(0).toUpperCase() + key.slice(1),
          dataIndex: key,

          key: key,

          width: 150,

          filters: generateFilters(data, key),
          fixed: index < 4,
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

        console.log("Fetched Data:", data);
        console.log("Generated Columns:", columns);
        setTableData(data);

        setTableColumns(columns);
        isFilterOfFilterBidSumData(data);
        setIsReportVisible(true);
        setDisplayedOption(projectCode);

        localStorage.setItem("tablebidsummaryData", JSON.stringify(data));
        localStorage.setItem("tableColumns", JSON.stringify(columns));
        localStorage.setItem("isReportVisible", true);
        localStorage.setItem("displayedOption", projectCode);
      } else {
        setTableColumns([]);
        setTableData([]);
        setIsReportVisible(false);
        localStorage.setItem("isReportVisible", false);
        message.info("No data available for the selected project.");
      }
    } catch (error) {
      message.error("Failed to fetch report data.");
      console.error(error);
    }
  };

  const handleShowReport = async () => {
    if (selectedBidProjectOption) {
      setLoading(true);
      try {
        await fetchReportData(selectedBidProjectOption);
        setDisplayedOption(selectedBidProjectOption);
      } catch {
      } finally {
        setLoading(false);
      }
    } else {
      message.warning("Please select a project first.");
    }
  };

  const handleMenuClick = ({ key }) => {
    setSelectedBidProjectOption(key);

    localStorage.setItem("selectedBidProjectOption", key);

    setTableData([]);
    setTableColumns([]);
    setIsReportVisible(false);
  };
  const filteredOptions = projectCodes.filter((option) =>
    option.toLowerCase().includes(searchText.toLowerCase())
  );
  const menu = (
    <div>
      <Input
        placeholder="Search project"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: "8px", width: "150px" }}
      />
      <Menu
        style={{
          maxHeight: "200px",
          overflowY: "auto",
        }}
        onClick={handleMenuClick}
      >
        {filteredOptions.map((code) => (
          <Menu.Item key={code}>{code}</Menu.Item>
        ))}
      </Menu>
    </div>
  );

  // const enhancedProjectBidSummaryColumns = tableColumns.map((col, index) => ({
  //   ...col,
  //   sorter: (a, b) => (a[col.dataIndex] > b[col.dataIndex] ? 1 : -1),
  //   sortOrder:
  //     tableParams.sorter?.columnKey === col.dataIndex
  //       ? tableParams.sorter.order
  //       : null,
  //   filters: [...new Set(tableData.map((item) => item[col.dataIndex]))].map(
  //     (value) => ({
  //       text: value,
  //       value,
  //     })
  //   ),
  //   filteredValue: tableParams.filters?.[col.dataIndex] || null,
  //   onFilter: (value, record) => record[col.dataIndex] === value,
  //   width: col.width || 150,
  //   onHeaderCell: (column) => ({
  //     width: column.width,
  //     onResize: handleResize(index),
  //   }),
  // }));

  const handleDownload = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data");

    const headerRow = worksheet.addRow(Object.keys(tableData[0]));
    headerRow.height = 20;
    headerRow.eachCell((cell) => {
      cell.font = {
        name: "Calibri",
        bold: false,
        size: 12,
        color: { argb: "FFFFFF" },
      };
      // cell.font = { fontStyle:"normal", fontSize:"20px", bold: false };
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

    tableData.forEach((item) => {
      worksheet.addRow(Object.values(item));
    });

    worksheet.columns.forEach((column) => {
      column.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "ProjectBidSummary.xlsx");
  };

  const getStoredTableState = () => {
    const storedState = localStorage.getItem("projectBidSummaryTableState");
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
      setTableColumns((prev) => {
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
      setTableColumns((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], width: size.width };
        localStorage.setItem("tableColumns", JSON.stringify(next));
        return next;
      });
    };

  // const handleResize =
  //   (index) =>
  //   (e, { size }) => {
  //     const nextCols = [...tableColumns];
  //     nextCols[index] = { ...nextCols[index], width: size.width };
  //     setTableColumns(nextCols);
  //   };

  const enhancedProjectBidSummaryColumns = tableColumns.map((col, index) => ({
    ...col,
    sorter: (a, b) => (a[col.dataIndex] > b[col.dataIndex] ? 1 : -1),
    sortOrder:
      tableParams.sorter?.columnKey === col.dataIndex
        ? tableParams.sorter.order
        : null,
    // filters: [...new Set(tableData.map((item) => item[col.dataIndex]))].map(
    //   (value) => ({
    //     text: value,
    //     value,
    //   })
    // ),
    filters: generateFilters(
      filterOfFilterBidSumData.length > 0
        ? filterOfFilterBidSumData
        : tableData,
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

  // const handleTableChange = (pagination, filters, sorter) => {
  //   const newState = {
  //     pagination,
  //     filters,
  //     sorter: sorter.columnKey ? sorter : {},
  //   };
  //   setTableParams(newState);
  //   localStorage.setItem(
  //     "projectBidSummaryTableState",
  //     JSON.stringify(newState)
  //   );
  // };

  const handleTableChange = (pagination, filters, sorter, extra) => {
    setTableParams({
      pagination,
      filters,
      sorter: sorter.columnKey ? sorter : {},
    });
    // isFilterOfFilterBidSumData(extra.currentDataSource || []);
    isFilterOfFilterBidSumData(extra.currentDataSource || tableData);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Row
          justify="center"
          gutter={16}
          style={{ marginBottom: 16, marginRight: 16 }}
        >
          <Col>
            <Dropdown overlay={menu} trigger={["click"]}>
              <Button>
                {selectedBidProjectOption || "Select a project"}{" "}
                <DownOutlined />
              </Button>
            </Dropdown>
          </Col>
        </Row>
        <Row justify="center" style={{ marginBottom: 16 }}>
          <Col>
            <Button
              type="primary"
              onClick={handleShowReport}
              disabled={!selectedBidProjectOption}
            >
              Show Report
            </Button>
          </Col>

          {isReportVisible && (
            <Col>
              <Button
                style={{ marginLeft: 18 }}
                type="primary"
                disabled={!selectedBidProjectOption}
                onClick={handleDownload}
              >
                Export Excel
              </Button>
            </Col>
          )}
        </Row>
      </div>
      <Row justify="center" style={{ marginTop: 24 }}>
        <Col span={24}>
          {selectedBidProjectOption && displayedOption && isReportVisible && (
            <div className="scrollable-table-wrapper">
              <Table
                bordered
                components={{
                  header: { cell: ResizableTitle },
                }}
                className="custom-table"
                dataSource={tableData}
                // scroll={{ x: "auto" }}ds
                // scroll={{x: "max-content", y : 400}}
                columns={enhancedProjectBidSummaryColumns}
                loading={loading}
                onChange={handleTableChange}
                pagination={false}
                scroll={{ x: "max-content", y: "calc(100vh - 450px)" }}
                //sticky
                // filteredValue={tableParams.filters}
                // sortOrder={tableParams.sorter?.order}
                // sortedInfo={tableParams.sorter}
           
                sticky={{ offsetHeader: 0 }}
                rowKey={(record) =>
                  record.id || record.key || JSON.stringify(record)
                }
              />
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ProjectBidSummary;
