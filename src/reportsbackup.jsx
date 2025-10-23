import React, { useState, useEffect, useCallback } from "react";
import { Dropdown,Menu, Button, message, Table, Alert, Row, Col, DatePicker,} from "antd";
import { DownOutlined } from "@ant-design/icons";
import { fetchProjectCodes } from "./utils";
import { useAuth } from "./AuthContext";
import axios from "axios";
import "./Reports.css";
import { ip_port } from "./Configs";

import { debounce } from "lodash";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import DoneReport from "./DoneReport";
import ProductivityReport from "./ProductivityReport";
import {PieChart,BarChart,Pie,Tooltip,Cell,XAxis,YAxis,Bar,ResponsiveContainer,Legend,} from "recharts";
import dayjs from "dayjs";
import ProjectBidSummary from "./ProjectBidSummary";
import handleDownload from "./tableReportsHandleDownload";
import handleExportAll from "./pieReportsHandleExportAll";
import Export_to_Excel from "./pieReportsExportSelected";
import renderBarChart from "./reportsRenderBarChart";

const Reports = () => {
  const { accessToken } = useAuth();

  const [options, setOptions] = useState([]);

  const [selectedReportType, setSelectedReportType] = useState(
    localStorage.getItem("reportSelectedOption") || null
  );
  const [isReportTypeSelected, setIsReportTypeSelected] = useState(false);

  const [selectedOption, setSelectedOption] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const [selectedDate, setSelectedDate] = useState();
  const [filteredData, setFilteredData] = useState([]);
  const [jsonData, setJsonData] = useState([]);

  const [showTable, setShowTable] = useState(false);
  const [selectedChart, setSelectedChart] = useState(null);
  const [pieData, setPieData] = useState([]);
  const [modeDataDetails, setModeDataDetails] = useState([]);

  const [displayedDate, setDisplayedDate] = useState(null);
  const [displayedChart, setDisplayedChart] = useState(null);
  const [hoveredSector, setHoveredSector] = useState(null);
  const [barData, setBarData] = useState(
    JSON.parse(localStorage.getItem("barData")) || []
  );
  const [filteredSectorData, setFilteredSectorData] = useState([]);
  const [showSectorTable, setShowSectorTable] = useState(false);
  const [dynamicColumns, setDynamicColumns] = useState([]);
  const [fetchedData, setFetchedData] = useState([]);
  // const [isDataFetched, setIsDataFetched] = useState(false);

  const [selectedSector, setSelectedSector] = useState({
    type: null, // "status" or "current_mode"
    sector: null,
  });
  // const [selectedStatusSector, setSelectedStatusSector] = useState(null);
  // const [selectedModeSector, setSelectedModeSector] = useState(null);

  useEffect(() => {
    localStorage.setItem("showTable", JSON.stringify(showTable));
  }, [showTable]);
  
  useEffect(() => {
    const savedShowTable = localStorage.getItem("showTable");
    const savedChart = localStorage.getItem("selectedChart");
  
    if (savedChart) {
      setSelectedChart(savedChart);
      if (savedShowTable && savedChart === "Table") {
        setShowTable(JSON.parse(savedShowTable));
      }
    }
  }, []);
  






  useEffect(() => {
    if (selectedReportType) {
      localStorage.setItem("selectedReportType", selectedReportType);
    }
    if (selectedOption) {
      localStorage.setItem("selectedOption", selectedOption);
    }
    if (reportData) {
      localStorage.setItem("reportData", JSON.stringify(reportData));
    }

    if (selectedDate) {
      localStorage.setItem("selectedDate", selectedDate);
    }
  }, [selectedReportType, selectedOption, reportData, selectedDate]);

  useEffect(() => {
    const storedReportType = localStorage.getItem("selectedReportType");
    const storedOption = localStorage.getItem("selectedOption");

    const storedReportData = localStorage.getItem("reportData");

    const storedSelectedDate = localStorage.getItem("selectedDate");

    if (storedReportType) {
      setSelectedReportType(storedReportType);
      setIsReportTypeSelected(true);
    }
    if (storedOption) {
      setSelectedOption(storedOption);
    }
    if (storedReportData) {
      setReportData(JSON.parse(storedReportData));
    }

    if (storedSelectedDate) {
      setSelectedDate(storedSelectedDate);
    }
  }, []);

  useEffect(() => {
    if (selectedChart) {
      localStorage.setItem("selectedChart", selectedChart);
    }
  }, [selectedChart]);

  useEffect(() => {
    const storedSectorTableData = localStorage.getItem("filteredSectorData");
    const storedSectorShowTable = localStorage.getItem("showSectorTable");
    if (storedSectorTableData)
      setFilteredSectorData(JSON.parse(storedSectorTableData));
    if (storedSectorShowTable)
      setShowSectorTable(JSON.parse(storedSectorShowTable));
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "filteredSectorData",
      JSON.stringify(filteredSectorData)
    );
    localStorage.setItem("showSectorTable", JSON.stringify(showSectorTable));
  }, [filteredSectorData, showSectorTable]);

  useEffect(() => {
    const savedFetchedData = localStorage.getItem("fetchedData");
    if (savedFetchedData) {
      setFetchedData(JSON.parse(savedFetchedData));
    }
    const savedSector = localStorage.getItem("selectedSector");
    const savedFilteredData = localStorage.getItem("filteredSectorData");

    if (savedSector && savedFilteredData) {
      setShowSectorTable(true);
      setFilteredSectorData(JSON.parse(savedFilteredData));
    }
  }, []);

  const fetchLoginLogs = async (dateToUse) => {
    try {
      const response = await axios.get(
        `http://${ip_port}/login_logs_with_offline_users/?date=${dateToUse}`
      );

      const data = await response.data;
      console.log("non-filtered-data", data);
      const filteredIdData = data.map(
        ({ _id, shot_logs, mode_logs, ...rest }) => rest
      );
      console.log("data", filteredIdData);
      setJsonData(filteredIdData);
      setFetchedData(filteredIdData);
      localStorage.setItem("fetchedData", JSON.stringify(filteredIdData));

      if (filteredIdData.length > 0) {
        console.log("filteredIdData", filteredIdData);
        let dynamicColumns = Object.keys(filteredIdData[0])
          .map((key, index) => ({
            title: key.replace(/_/g, " ").toUpperCase(),
            dataIndex: key,
            key: key,
            fixed: index < 2,
          }))
          .filter((dynamiccolumn) => dynamiccolumn.key !== "mode_logs");

        setDynamicColumns(dynamicColumns);
      }
      // console.log("dynamiccolumns", dynamicColumns)
      return filteredIdData;
    } catch (error) {
      console.error("Error fetching the JSON file:", error);
      return [];
    }
  };

  const handleDateChange = (date, dateString) => {
    console.log("date", date, typeof date);
    if (date) {
      const formattedDate = date ? date.format("YYYY-MM-DD") : null;
      console.log("formatdate", formattedDate);
      setSelectedDate(formattedDate);

      setShowSectorTable(false);
      setFilteredSectorData([]);

      localStorage.setItem("selectedDate", formattedDate);
    }
  };

  const handleChartTypeChange = (e) => {
    if (e.key === "select") {
      message.info("No chart selected.");
    } else {
      setSelectedChart(e.key);
      localStorage.setItem("selectedChart", e.key);
    }
  };

  const chartTypesMenu = (
    <Menu onClick={handleChartTypeChange}>
      <Menu.Item key="select">select</Menu.Item>
      <Menu.Item key="PieChart">Pie Chart</Menu.Item>
      <Menu.Item key="BarGraph">Bar Graph</Menu.Item>
      <Menu.Item key="Table">Table</Menu.Item>
    </Menu>
  );

  const handleGetData = useCallback(
    debounce(() => {
      setLoading(true);

      const dateToUse = selectedDate || localStorage.getItem("selectedDate");
      const chartToUse = selectedChart || localStorage.getItem("selectedChart");
      console.log("chartToUse", chartToUse)

      if (!dateToUse) {
        message.warning("Please select a date first.");
        return;
      }
      if (!chartToUse) {
        message.warning("Please select a chart type.");
        return;
      }

      fetchLoginLogs(dateToUse)
        .then((Data) => {
          if (Data.length === 0) {
            setShowTable(false);
            localStorage.setItem("showTable", JSON.stringify(false));
            setJsonData([]);
            setFetchedData([]);
            setPieData([]);
            setModeDataDetails([]);
            setBarData([]);
          } else {
            if (chartToUse === "Table") {
              setJsonData(Data);
              setFetchedData(Data);
              setShowTable(true);
              
             
              // localStorage.setItem("showTable", JSON.stringify(true));
              setPieData([]);
             
              setModeDataDetails([]);
              // setJsonData(Data);
              // setFetchedData(Data);
              // setShowTable(true);

              localStorage.setItem("tableData", JSON.stringify(Data));
              localStorage.setItem("showTable", JSON.stringify(true));
              
            } else if (chartToUse === "PieChart") {
              setShowTable(false);
              localStorage.setItem("showTable", JSON.stringify(false)); 
            
              const totalItems = Data.length;

              const statusCounts = Data.reduce((acc, item) => {
                acc[item.status] = (acc[item.status] || 0) + 1;
                return acc;
              }, {});

              let pieData = Object.keys(statusCounts).map((key) => {
                let percentage = (statusCounts[key] / totalItems) * 100;
                return {
                  name: key,
                  value: statusCounts[key],
                  percentage: percentage.toFixed(2),
                };
              });

              const sumPercentages = pieData.reduce(
                (sum, item) => sum + parseFloat(item.percentage),
                0
              );
              const diff = (100 - sumPercentages).toFixed(2);
              if (pieData.length > 0 && Math.abs(diff) > 0.01) {
                pieData[pieData.length - 1].percentage = (
                  parseFloat(pieData[pieData.length - 1].percentage) +
                  parseFloat(diff)
                ).toFixed(2);
              }

              setPieData(pieData);

              calculateModeData(Data);

              localStorage.setItem("pieData", JSON.stringify(pieData));
            } else if (selectedChart === "BarGraph") {
              const statusCounts = Data.reduce((acc, item) => {
                acc[item.status] = (acc[item.status] || 0) + 1;
                return acc;
              }, {});

              const modeCounts = Data.reduce((acc, item) => {
                acc[item.current_mode] = (acc[item.current_mode] || 0) + 1;
                return acc;
              }, {});

              const statusBarData = Object.keys(statusCounts).map((key) => ({
                name: key,
                value: statusCounts[key],
              }));

              const modeBarData = Object.keys(modeCounts).map((key) => ({
                name: key,
                value: modeCounts[key],
              }));

              setBarData({ statusBarData, modeBarData });
              localStorage.setItem(
                "barData",
                JSON.stringify({ statusBarData, modeBarData })
              );
            } else {
              setShowTable(false);
            }

            setDisplayedDate(dateToUse);
            setDisplayedChart(chartToUse);

            localStorage.setItem("selectedDate", dateToUse);
            localStorage.setItem("tableData", JSON.stringify(filteredData));
            localStorage.setItem("selectedChart", selectedChart);
          }
        })

        .finally(() => setLoading(false)); 
    }, 50),
    [selectedDate, selectedChart]
  );

  const loadChartData = () => {
    const savedPieData = localStorage.getItem("pieData");
    const savedModeData = localStorage.getItem("modeDataDetails");

    if (savedPieData && savedModeData) {
      setPieData(JSON.parse(savedPieData));
      setModeDataDetails(JSON.parse(savedModeData));
    }
  };
  useEffect(() => {
    loadChartData();
  }, []);

  useEffect(() => {
    const savedDate = localStorage.getItem("selectedDate");

    const savedTableData = localStorage.getItem("tableData");
    const savedChart = localStorage.getItem("selectedChart");
    if (savedDate) setSelectedDate(savedDate);
    if (savedChart) setSelectedChart(savedChart);
    if (savedTableData) setFilteredData(JSON.parse(savedTableData));
  
    if (savedChart === "Table" && savedTableData) {
      setShowTable(true);
    }
    
  
  }, []);

  useEffect(() => {
    const savedTableData = localStorage.getItem("tableData");
    const savedShowTable = localStorage.getItem("showTable");
  
    if (savedTableData) {
      setJsonData(JSON.parse(savedTableData));
      setFetchedData(JSON.parse(savedTableData));
    }
  
    if (savedShowTable) {
      setShowTable(JSON.parse(savedShowTable));
    }
  }, []);
  


  useEffect(() => {
    const savedShowTable = localStorage.getItem("showTable");
    const savedTableData = localStorage.getItem("tableData");
  
    if (savedShowTable !== null) {
      setShowTable(JSON.parse(savedShowTable));
    }
  
    if (savedTableData) {
      const parsedData = JSON.parse(savedTableData);
      setJsonData(parsedData);
      setFetchedData(parsedData);
    }
  }, []);
  
  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const projectCodes = await fetchProjectCodes(accessToken);
        setOptions(projectCodes);
      } catch (error) {
        message.error("Failed to fetch project codes.");
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [accessToken]);

  useEffect(() => {
    const storedOption = localStorage.getItem("selectedOption");
    const storedReportData = localStorage.getItem("reportData");

    if (storedOption) {
      setSelectedOption(storedOption);
    }
    if (storedReportData) {
      setReportData(JSON.parse(storedReportData));
    }
  }, []);

  useEffect(() => {
    const storedReportType = localStorage.getItem("selectedReportType");
    const storedDate = localStorage.getItem("selectedDate");

    if (storedReportType) {
      setSelectedReportType(storedReportType);
      setIsReportTypeSelected(true);
    }

    if (storedDate) {
      setSelectedDate(storedDate);
    }
  }, []);

  const reportTypes = [
    "Employee DashBoard",
    "Bidding Summary",
    "Done Report",
    "Productivity Report",
  ];

  const handleReportTypeChange = (e) => {
    const selectedType = e.key;
    setSelectedReportType(selectedType);
    setIsReportTypeSelected(true);
    localStorage.setItem("selectedReportType", selectedType);

    if (selectedType === "Employee DashBoard") {
      setSelectedDate(today);
      localStorage.setItem("selectedDate", today);
    }
  };

  const reportTypesMenu = (
    <Menu onClick={handleReportTypeChange}>
      {reportTypes.map((type) => (
        <Menu.Item key={type}>{type}</Menu.Item>
      ))}
    </Menu>
  );

  const handlePieSectorClick = (data, index, filterType) => {
    const sectorName = data.name;

    let filteredBySector;
    if (filterType === "status") {
      filteredBySector = fetchedData.filter(
        (item) => item.status === sectorName
      );
    } else if (filterType === "current_mode") {
      filteredBySector = fetchedData.filter(
        (item) => item.current_mode === sectorName
      );
    }

    setFilteredSectorData(filteredBySector);

    setSelectedSector({ type: filterType, sector: sectorName });
    setShowSectorTable(true);

    localStorage.setItem("selectedSector", JSON.stringify(sectorName));
    localStorage.setItem(
      "filteredSectorData",
      JSON.stringify(filteredBySector)
    );
  };

  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";

    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;

      color += ("00" + value.toString(16)).substr(-2);
    }
    return color;
  };

  const renderPieChart = (data) => {
    if (!pieData || pieData.length === 0) return null;

    const totalValue = pieData.reduce((sum, entry) => sum + entry.value, 0);

    const dataWithPercentage = pieData.map((entry) => ({
      ...entry,
      percentage: ((entry.value / totalValue) * 100).toFixed(2),
    }));

    return (
      <div
        className="pie-chart-container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          width: "100%",
          maxWidth: "600px",
          margin: "0 auto",
          marginTop: "10px",
          padding: "10px",
        }}
      >
        <svg style={{ height: 0 }}>
          <defs>
            <filter
              id="pie-shadow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feDropShadow
                dx="6"
                dy="8"
                stdDeviation="5"
                floodColor="black"
                floodOpacity="0.3"
              />
            </filter>
            <radialGradient id="slice-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#8884d8" />
            </radialGradient>
          </defs>
        </svg>
        <ResponsiveContainer width="100%" aspect={1}>
          <PieChart>
            <Pie
              data={dataWithPercentage}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="80%"
              fill="#8884d8"
              label={(entry) => ` ${entry.value} `}
              labelLine={{ length: 10, length2: 10 }}
              onMouseEnter={(data, index) => setHoveredSector(data)}
              onMouseLeave={() => setHoveredSector(null)}
              onClick={(data, index) =>
                handlePieSectorClick(data, index, "status")
              }
            >
              {dataWithPercentage.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={stringToColor(entry.name)}
                  style={{
                    // filter: "drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.2))",
                    filter:
                      "drop-shadow(8px 24px 8px rgba(0.2, 0.2, 0.2, 0.2))",
                  }}
                />
              ))}
            </Pie>

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div
                      style={{
                        background: "white",
                        padding: "5px",
                        border: "1px solid #ccc",
                      }}
                    >
                      <strong>{payload[0].name}</strong>: {payload[0].value} (
                      {payload[0].payload.percentage}%)
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>

          <div style={{display: "flex",flexWrap: "wrap",marginTop: "0px",paddingTop: "0px", }}
          >
            {pieData.map((entry, index) => (
              <div
                key={index}
                style={{ display: "flex",alignItems: "center",marginRight: "15px",marginBottom: "5px",
                }}
              >
                <div
                  style={{width: "12px",height: "12px",backgroundColor: stringToColor(entry.name),marginRight: "1px",marginLeft: "35px",
                  }}
                />
                <span
                  style={{ fontSize: "14px", fontWeight: "bold" }}
                >{`${entry.name}: ${entry.value} (${entry.percentage}%)`}</span>
              </div>
            ))}
          </div>
        </ResponsiveContainer>
      </div>
    );
  };

  const calculateModeData = (filtered) => {
    if (!filtered || filtered.length === 0) return []; 
    const modeCounts = filtered.reduce((acc, item) => {
      acc[item.current_mode] = (acc[item.current_mode] || 0) + 1;
      return acc;
    }, {});

    const totalItems = filtered.length;

    const modeDetails = Object.keys(modeCounts).map((key) => ({
      name: key,
      value: modeCounts[key],
      percentage: ((modeCounts[key] / totalItems) * 100).toFixed(2),
    }));

    setModeDataDetails(modeDetails);
    localStorage.setItem("modeDataDetails", JSON.stringify(modeDetails));
  };

  useEffect(() => {
    const storedDate = localStorage.getItem("selectedDate");
    const storedChart = localStorage.getItem("selectedChart");
    if (storedDate) setDisplayedDate(storedDate);
    if (storedChart) setDisplayedChart(storedChart);

    const storedPieData = JSON.parse(localStorage.getItem("pieData"));
    if (storedPieData) setPieData(storedPieData);

    const storedModeData = JSON.parse(localStorage.getItem("modeDataDetails"));
    if (storedModeData) setModeDataDetails(storedModeData);
  }, []);

  const generateCurrentModeColor = (index, total) => {
    const hue = (index / total) * 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  const renderModePieChart = () => {
    console.log("modedatadetails", modeDataDetails);
    const totalValue = modeDataDetails.reduce(
      (sum, entry) => sum + entry.value,
      0
    );

    let rawPercentages = pieData.map(
      (entry) => (entry.value / totalValue) * 100
    );

    let roundedPercentages = rawPercentages.map(
      (percent) => Math.round(percent * 100) / 100
    );
    let roundedTotal = roundedPercentages.reduce(
      (sum, percent) => sum + percent,
      0
    );

    let difference = 100 - roundedTotal;
    roundedPercentages[roundedPercentages.length - 1] += difference;

    const dataWithPercentage = modeDataDetails.map((entry) => ({
      ...entry,
      percentage: ((entry.value / totalValue) * 100).toFixed(2),
    }));

    return (
      <div
        className="pie-chart-container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",

          marginTop: "30px",
          padding: "10px",
          width: "100%",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        <svg style={{ height: 0 }}>
          <defs>
            <filter
              id="pie-shadow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feDropShadow
                dx="6"
                dy="8"
                stdDeviation="5"
                floodColor="black"
                floodOpacity="0.3"
              />
            </filter>
            <radialGradient id="slice-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#8884d8" />
            </radialGradient>
          </defs>
        </svg>

        <ResponsiveContainer width="100%" aspect={1}>
          <PieChart>
            <Pie
              data={dataWithPercentage}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="80%"
              fill="#8884d8"
              label={(entry) => ` ${entry.value}`}
              onClick={(data, index) =>
                handlePieSectorClick(data, index, "current_mode")
              }
            >
              {dataWithPercentage.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={generateCurrentModeColor(
                    index,
                    dataWithPercentage.length
                  )}
                  style={{
                    // filter: "drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.2))",
                    filter:
                      "drop-shadow(8px 24px 8px rgba(0.2, 0.2, 0.2, 0.2))",
                  }}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div
                      style={{
                        background: "white",
                        padding: "5px",
                        border: "1px solid #ccc",
                      }}
                    >
                      <strong>{payload[0].name}</strong>: {payload[0].value} (
                      {payload[0].payload.percentage}%)
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              marginTop: "-10px",
              paddingTop: "0px",
            }}
          >
            {dataWithPercentage.map((entry, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginRight: "15px",
                  marginBottom: "5px",
                }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: generateCurrentModeColor(
                      index,
                      dataWithPercentage.length
                    ),
                    marginRight: "5px",
                    marginLeft: "30px",
                  }}
                />
                <span
                  style={{ fontSize: "14px", fontWeight: "bold" }}
                >{`${entry.name}: ${entry.value} (${entry.percentage}%)`}</span>
              </div>
            ))}
          </div>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderSectorTable = () => {
    if (!filteredSectorData || filteredSectorData.length === 0) {
      return <div>No data available</div>;
    }

    const columns = Object.keys(filteredSectorData[0])
      .map((key, index) => ({
        title: key.charAt(0).toUpperCase() + key.slice(1),
        dataIndex: key,
        key: key,
        width: 150,
        fixed: index < 2 ? "left" : null,
      }))
      .filter((column) => column.key !== "mode_logs");
    return (
      <Table
        className="custom-table"
        columns={columns}
        dataSource={filteredSectorData}
        rowKey={(record) => record.id || Math.random()}
        pagination={false}
        style={{ width: "80%", marginTop: "20px" }}
        scroll={{ x: "max-content", y: 400 }}
      />
    );
  };

  useEffect(() => {
    const storedSelectedChart = localStorage.getItem("selectedChart");
    const storedFilteredData = JSON.parse(localStorage.getItem("tableData"));
    const storedBarData = JSON.parse(localStorage.getItem("barData"));

    if (storedSelectedChart) setSelectedChart(storedSelectedChart);
    if (storedFilteredData) setFilteredData(storedFilteredData);
    if (storedBarData) setBarData(storedBarData);
  }, []);

  const handleExport = (fileName) => {
    if (filteredSectorData.length > 0) {
      Export_to_Excel(filteredSectorData, fileName);
    }
  };

  return (
    <div className="reports-container">
      <Row justify="center" style={{ marginTop: "8px", marginBottom: "35px" }}>
        <Col>
          <label style={{ marginRight: 8, marginBottom: "10px" }}>
            Report Type:
          </label>
          <Dropdown overlay={reportTypesMenu}>
            <Button>
              {selectedReportType ? selectedReportType : "Select Report Type"}{" "}
              <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>

      {isReportTypeSelected && selectedReportType === "Done Report" && (
        <DoneReport />
      )}

      {isReportTypeSelected && selectedReportType === "Productivity Report" && (
        <ProductivityReport />
      )}

      {isReportTypeSelected && selectedReportType === "Bidding Summary" && (
        <ProjectBidSummary />
      )}

      {isReportTypeSelected && selectedReportType === "Employee DashBoard" && (
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
                value={selectedDate ? dayjs(selectedDate) : null}
                format="YYYY-MM-DD"
                allowClear
              />
            </div>

            <div style={{ marginBottom: 16, marginLeft: 16 }}>
              <label style={{ marginRight: 8 }}>Select Chart: </label>
              <Dropdown overlay={chartTypesMenu}>
                <Button>
                  {selectedChart ? selectedChart : "Select Chart"}{" "}
                  <DownOutlined />
                </Button>
              </Dropdown>
            </div>

            <div style={{ marginBottom: 16, marginLeft: 1 }}>
              <Button
                type="primary"
                onClick={handleGetData}
                disabled={!selectedDate || !selectedChart}
              >
                Get Data
              </Button>
            </div>
          </div>

          {showTable && displayedChart === "Table" && jsonData.length > 0 && (
            <>
              <div
                className="download_button_container"
                style={{ display: "flex", justifyContent: "flex-start" }}
              >
                <Button
                  type="primary"
                  className="download_button"
                  onClick={() => handleDownload(dynamicColumns, jsonData)}
                  style={{ marginBottom: 16, marginLeft: "auto" }}
                >
                  Export Excel
                </Button>
              </div>

              <Table
                className="custom-table"
                dataSource={jsonData}
                columns={dynamicColumns}
                rowKey={(item, index) => index}
                style={{ marginTop: 24 }}
                scroll={{ x: 4500, y: 400 }}
              />
            </>
          )}

          {displayedChart === "PieChart" && pieData.length > 0 && (
            <div
              style={{display: "flex",flexDirection: "row",justifyContent: "center",aligItems: "center",gap: "10px",
                marginTop: "20px",
              }}
            >
              <div
                style={{display: "flex",flexDirection: "column",justifyContent: "center",alignItems: "center",
                  width: "45%",
                }}
              >
                <h3
                  style={{ textAlign: "center", marginRight: "100px", marginBottom: "3px",marginTop: "50px",
              textDecoration: "underline",
                    fontSize: "22px",
                  }}
                >
                  Status Distribution
                </h3>

                <button
                  className="Export_status_pie_button"
                  onClick={() => handleExport("Status_Distribution")}
                  disabled={selectedSector.type !== "status"}
                >
                  Export Selected
                </button>
                {renderPieChart()}
              </div>
              <div>
                <button
                  className="Export_all_button"
                  onClick={() => handleExportAll(fetchedData)}
                >
                  Export All
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "45%",
                  marginTop: "20px",
                }}
              >
                <h3
                  style={{
                    textAlign: "center",
                    marginRight: "100px",
                    marginBottom: "10px",
                    marginTop: "12px",
                    textDecoration: "underline",
                    fontSize: "22px",
                  }}
                >
                  Current Mode Distribution
                </h3>
                <button
                  className="Export_mode_pie_button"
                  disabled={selectedSector.type !== "current_mode"}
                  onClick={() => handleExport("Mode_Distribution")}
                >
                  Export Selected
                </button>
                {renderModePieChart()}
              </div>
            </div>
          )}

          {displayedChart === "PieChart" &&
            showSectorTable &&
            filteredSectorData.length > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "30px",
                }}
              >
                {renderSectorTable()}
              </div>
            )}

          {displayedChart === "BarGraph" && barData && (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                gap: "30px",
              }}
            >
              {barData.statusBarData &&
                renderBarChart(barData.statusBarData, "Status Distribution", 0)}
              {barData.modeBarData &&
                renderBarChart(
                  barData.modeBarData,
                  "Current Mode Distribution",
                  180
                )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;


















// import React, { useState, useEffect, useCallback } from "react";
// import { Dropdown,Menu, Button, message, Table, Alert, Row, Col, DatePicker,} from "antd";
// import { DownOutlined } from "@ant-design/icons";
// import { fetchProjectCodes } from "./utils";
// import { useAuth } from "./AuthContext";
// import axios from "axios";
// import "./Reports.css";
// import { ip_port } from "./Configs";

// import { debounce } from "lodash";
// import * as XLSX from "xlsx";
// import ExcelJS from "exceljs";
// import { saveAs } from "file-saver";
// import DoneReport from "./DoneReport";
// import ProductivityReport from "./ProductivityReport";
// import {PieChart,BarChart,Pie,Tooltip,Cell,XAxis,YAxis,Bar,ResponsiveContainer,Legend,} from "recharts";
// import dayjs from "dayjs";
// import ProjectBidSummary from "./ProjectBidSummary";
// import handleDownload from "./tableReportsHandleDownload";
// import handleExportAll from "./pieReportsHandleExportAll";
// import Export_to_Excel from "./pieReportsExportSelected";
// import renderBarChart from "./reportsRenderBarChart";

// const Reports = () => {
//   const { accessToken } = useAuth();

//   const [options, setOptions] = useState([]);

//   const [selectedReportType, setSelectedReportType] = useState(
//     localStorage.getItem("reportSelectedOption") || null
//   );
//   const [isReportTypeSelected, setIsReportTypeSelected] = useState(false);

//   const [selectedOption, setSelectedOption] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [reportData, setReportData] = useState([]);
//   const [tableLoading, setTableLoading] = useState(false);
//   const [showAlert, setShowAlert] = useState(false);

//   const [selectedDate, setSelectedDate] = useState();
//   const [filteredData, setFilteredData] = useState([]);
//   const [jsonData, setJsonData] = useState([]);

//   const [showTable, setShowTable] = useState(false);
//   const [selectedChart, setSelectedChart] = useState(null);
//   const [pieData, setPieData] = useState([]);
//   const [modeDataDetails, setModeDataDetails] = useState([]);

//   const [displayedDate, setDisplayedDate] = useState(null);
//   const [displayedChart, setDisplayedChart] = useState(null);
//   const [hoveredSector, setHoveredSector] = useState(null);
//   const [barData, setBarData] = useState(
//     JSON.parse(localStorage.getItem("barData")) || []
//   );
//   const [filteredSectorData, setFilteredSectorData] = useState([]);
//   const [showSectorTable, setShowSectorTable] = useState(false);
//   const [dynamicColumns, setDynamicColumns] = useState([]);
//   const [fetchedData, setFetchedData] = useState([]);
//   // const [isDataFetched, setIsDataFetched] = useState(false);

//   const [selectedSector, setSelectedSector] = useState({
//     type: null, // "status" or "current_mode"
//     sector: null,
//   });
//   // const [selectedStatusSector, setSelectedStatusSector] = useState(null);
//   // const [selectedModeSector, setSelectedModeSector] = useState(null);

//   useEffect(() => {
//     localStorage.setItem("showTable", JSON.stringify(showTable));
//   }, [showTable]);
  
//   useEffect(() => {
//     const savedShowTable = localStorage.getItem("showTable");
//     const savedChart = localStorage.getItem("selectedChart");
  
//     if (savedChart) {
//       setSelectedChart(savedChart);
//       if (savedShowTable && savedChart === "Table") {
//         setShowTable(JSON.parse(savedShowTable));
//       }
//     }
//   }, []);
  






//   useEffect(() => {
//     if (selectedReportType) {
//       localStorage.setItem("selectedReportType", selectedReportType);
//     }
//     if (selectedOption) {
//       localStorage.setItem("selectedOption", selectedOption);
//     }
//     if (reportData) {
//       localStorage.setItem("reportData", JSON.stringify(reportData));
//     }

//     if (selectedDate) {
//       localStorage.setItem("selectedDate", selectedDate);
//     }
//   }, [selectedReportType, selectedOption, reportData, selectedDate]);

//   useEffect(() => {
//     const storedReportType = localStorage.getItem("selectedReportType");
//     const storedOption = localStorage.getItem("selectedOption");

//     const storedReportData = localStorage.getItem("reportData");

//     const storedSelectedDate = localStorage.getItem("selectedDate");

//     if (storedReportType) {
//       setSelectedReportType(storedReportType);
//       setIsReportTypeSelected(true);
//     }
//     if (storedOption) {
//       setSelectedOption(storedOption);
//     }
//     if (storedReportData) {
//       setReportData(JSON.parse(storedReportData));
//     }

//     if (storedSelectedDate) {
//       setSelectedDate(storedSelectedDate);
//     }
//   }, []);

//   useEffect(() => {
//     if (selectedChart) {
//       localStorage.setItem("selectedChart", selectedChart);
//     }
//   }, [selectedChart]);

//   useEffect(() => {
//     const storedSectorTableData = localStorage.getItem("filteredSectorData");
//     const storedSectorShowTable = localStorage.getItem("showSectorTable");
//     if (storedSectorTableData)
//       setFilteredSectorData(JSON.parse(storedSectorTableData));
//     if (storedSectorShowTable)
//       setShowSectorTable(JSON.parse(storedSectorShowTable));
//   }, []);

//   useEffect(() => {
//     localStorage.setItem(
//       "filteredSectorData",
//       JSON.stringify(filteredSectorData)
//     );
//     localStorage.setItem("showSectorTable", JSON.stringify(showSectorTable));
//   }, [filteredSectorData, showSectorTable]);

//   useEffect(() => {
//     const savedFetchedData = localStorage.getItem("fetchedData");
//     if (savedFetchedData) {
//       setFetchedData(JSON.parse(savedFetchedData));
//     }
//     const savedSector = localStorage.getItem("selectedSector");
//     const savedFilteredData = localStorage.getItem("filteredSectorData");

//     if (savedSector && savedFilteredData) {
//       setShowSectorTable(true);
//       setFilteredSectorData(JSON.parse(savedFilteredData));
//     }
//   }, []);

//   const fetchLoginLogs = async (dateToUse) => {
//     try {
//       const response = await axios.get(
//         `http://${ip_port}/login_logs_with_offline_users/?date=${dateToUse}`
//       );

//       const data = await response.data;
//       console.log("non-filtered-data", data);
//       const filteredIdData = data.map(
//         ({ _id, shot_logs, mode_logs, ...rest }) => rest
//       );
//       console.log("data", filteredIdData);
//       setJsonData(filteredIdData);
//       setFetchedData(filteredIdData);
//       localStorage.setItem("fetchedData", JSON.stringify(filteredIdData));

//       if (filteredIdData.length > 0) {
//         console.log("filteredIdData", filteredIdData);
//         let dynamicColumns = Object.keys(filteredIdData[0])
//           .map((key, index) => ({
//             title: key.replace(/_/g, " ").toUpperCase(),
//             dataIndex: key,
//             key: key,
//             fixed: index < 2,
//           }))
//           .filter((dynamiccolumn) => dynamiccolumn.key !== "mode_logs");

//         setDynamicColumns(dynamicColumns);
//       }
//       // console.log("dynamiccolumns", dynamicColumns)
//       return filteredIdData;
//     } catch (error) {
//       console.error("Error fetching the JSON file:", error);
//       return [];
//     }
//   };

//   const handleDateChange = (date, dateString) => {
//     console.log("date", date, typeof date);
//     if (date) {
//       const formattedDate = date ? date.format("YYYY-MM-DD") : null;
//       console.log("formatdate", formattedDate);
//       setSelectedDate(formattedDate);

//       setShowSectorTable(false);
//       setFilteredSectorData([]);

//       localStorage.setItem("selectedDate", formattedDate);
//     }
//   };

//   const handleChartTypeChange = (e) => {
//     if (e.key === "select") {
//       message.info("No chart selected.");
//     } else {
//       setSelectedChart(e.key);
//       localStorage.setItem("selectedChart", e.key);
//     }
//   };

//   const chartTypesMenu = (
//     <Menu onClick={handleChartTypeChange}>
//       <Menu.Item key="select">select</Menu.Item>
//       <Menu.Item key="PieChart">Pie Chart</Menu.Item>
//       <Menu.Item key="BarGraph">Bar Graph</Menu.Item>
//       <Menu.Item key="Table">Table</Menu.Item>
//     </Menu>
//   );

//   const handleGetData = useCallback(
//     debounce(() => {
//       setLoading(true);

//       const dateToUse = selectedDate || localStorage.getItem("selectedDate");
//       const chartToUse = selectedChart || localStorage.getItem("selectedChart");
//       console.log("chartToUse", chartToUse)

//       if (!dateToUse) {
//         message.warning("Please select a date first.");
//         return;
//       }
//       if (!chartToUse) {
//         message.warning("Please select a chart type.");
//         return;
//       }

//       fetchLoginLogs(dateToUse)
//         .then((Data) => {
//           if (Data.length === 0) {
//             setShowTable(false);
//             localStorage.setItem("showTable", JSON.stringify(false));
//             setJsonData([]);
//             setFetchedData([]);
//             setPieData([]);
//             setModeDataDetails([]);
//             setBarData([]);
//           } else {
//             if (chartToUse === "Table") {
//               setJsonData(Data);
//               setFetchedData(Data);
//               setShowTable(true);
//               localStorage.setItem("tableData", JSON.stringify(Data));
//               localStorage.setItem("showTable", JSON.stringify(true));
             
//               // localStorage.setItem("showTable", JSON.stringify(true));
//               setPieData([]);
             
//               setModeDataDetails([]);
//               // setJsonData(Data);
//               // setFetchedData(Data);
//               // setShowTable(true);
              
              
//             } else if (chartToUse === "PieChart") {
//               setShowTable(false);
//               localStorage.setItem("showTable", JSON.stringify(false)); 
            
//               const totalItems = Data.length;

//               const statusCounts = Data.reduce((acc, item) => {
//                 acc[item.status] = (acc[item.status] || 0) + 1;
//                 return acc;
//               }, {});

//               let pieData = Object.keys(statusCounts).map((key) => {
//                 let percentage = (statusCounts[key] / totalItems) * 100;
//                 return {
//                   name: key,
//                   value: statusCounts[key],
//                   percentage: percentage.toFixed(2),
//                 };
//               });

//               const sumPercentages = pieData.reduce(
//                 (sum, item) => sum + parseFloat(item.percentage),
//                 0
//               );
//               const diff = (100 - sumPercentages).toFixed(2);
//               if (pieData.length > 0 && Math.abs(diff) > 0.01) {
//                 pieData[pieData.length - 1].percentage = (
//                   parseFloat(pieData[pieData.length - 1].percentage) +
//                   parseFloat(diff)
//                 ).toFixed(2);
//               }

//               setPieData(pieData);

//               calculateModeData(Data);

//               localStorage.setItem("pieData", JSON.stringify(pieData));
//             } else if (selectedChart === "BarGraph") {
//               const statusCounts = Data.reduce((acc, item) => {
//                 acc[item.status] = (acc[item.status] || 0) + 1;
//                 return acc;
//               }, {});

//               const modeCounts = Data.reduce((acc, item) => {
//                 acc[item.current_mode] = (acc[item.current_mode] || 0) + 1;
//                 return acc;
//               }, {});

//               const statusBarData = Object.keys(statusCounts).map((key) => ({
//                 name: key,
//                 value: statusCounts[key],
//               }));

//               const modeBarData = Object.keys(modeCounts).map((key) => ({
//                 name: key,
//                 value: modeCounts[key],
//               }));

//               setBarData({ statusBarData, modeBarData });
//               localStorage.setItem(
//                 "barData",
//                 JSON.stringify({ statusBarData, modeBarData })
//               );
//             } else {
//               setShowTable(false);
//             }

//             setDisplayedDate(dateToUse);
//             setDisplayedChart(chartToUse);

//             localStorage.setItem("selectedDate", dateToUse);
//             localStorage.setItem("tableData", JSON.stringify(filteredData));
//             localStorage.setItem("selectedChart", selectedChart);
//           }
//         })

//         .finally(() => setLoading(false)); 
//     }, 50),
//     [selectedDate, selectedChart]
//   );

//   const loadChartData = () => {
//     const savedPieData = localStorage.getItem("pieData");
//     const savedModeData = localStorage.getItem("modeDataDetails");

//     if (savedPieData && savedModeData) {
//       setPieData(JSON.parse(savedPieData));
//       setModeDataDetails(JSON.parse(savedModeData));
//     }
//   };
//   useEffect(() => {
//     loadChartData();
//   }, []);

//   useEffect(() => {
//     const savedDate = localStorage.getItem("selectedDate");

//     const savedTableData = localStorage.getItem("tableData");
//     const savedChart = localStorage.getItem("selectedChart");
//     if (savedDate) setSelectedDate(savedDate);
//     if (savedChart) setSelectedChart(savedChart);
//     if (savedTableData) setFilteredData(JSON.parse(savedTableData));
  
//     if (savedChart === "Table" && savedTableData) {
//       setShowTable(true);
//     }
    
  
//   }, []);

//   // useEffect(() => {
//   //   const savedTableData = localStorage.getItem("tableData");
//   //   const savedShowTable = localStorage.getItem("showTable");
  
//   //   if (savedTableData) {
//   //     setJsonData(JSON.parse(savedTableData));
//   //     setFetchedData(JSON.parse(savedTableData));
//   //   }
  
//   //   if (savedShowTable) {
//   //     setShowTable(JSON.parse(savedShowTable));
//   //   }
//   // }, []);
  


//   useEffect(() => {
//     const savedShowTable = localStorage.getItem("showTable");
//     const savedTableData = localStorage.getItem("tableData");
  
//     if (savedShowTable !== null) {
//       setShowTable(JSON.parse(savedShowTable));
//     }
  
//     if (savedTableData) {
//       const parsedData = JSON.parse(savedTableData);
//       setJsonData(parsedData);
//       setFetchedData(parsedData);
//     }
//   }, []);
  
//   useEffect(() => {
//     const fetchOptions = async () => {
//       setLoading(true);
//       try {
//         const projectCodes = await fetchProjectCodes(accessToken);
//         setOptions(projectCodes);
//       } catch (error) {
//         message.error("Failed to fetch project codes.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOptions();
//   }, [accessToken]);

//   useEffect(() => {
//     const storedOption = localStorage.getItem("selectedOption");
//     const storedReportData = localStorage.getItem("reportData");

//     if (storedOption) {
//       setSelectedOption(storedOption);
//     }
//     if (storedReportData) {
//       setReportData(JSON.parse(storedReportData));
//     }
//   }, []);

//   useEffect(() => {
//     const storedReportType = localStorage.getItem("selectedReportType");
//     const storedDate = localStorage.getItem("selectedDate");

//     if (storedReportType) {
//       setSelectedReportType(storedReportType);
//       setIsReportTypeSelected(true);
//     }

//     if (storedDate) {
//       setSelectedDate(storedDate);
//     }
//   }, []);

//   const reportTypes = [
//     "Employee DashBoard",
//     "Bidding Summary",
//     "Done Report",
//     "Productivity Report",
//   ];

//   const handleReportTypeChange = (e) => {
//     const selectedType = e.key;
//     setSelectedReportType(selectedType);
//     setIsReportTypeSelected(true);
//     localStorage.setItem("selectedReportType", selectedType);

//     if (selectedType === "Employee DashBoard") {
//       setSelectedDate(today);
//       localStorage.setItem("selectedDate", today);
//     }
//   };

//   const reportTypesMenu = (
//     <Menu onClick={handleReportTypeChange}>
//       {reportTypes.map((type) => (
//         <Menu.Item key={type}>{type}</Menu.Item>
//       ))}
//     </Menu>
//   );

//   const handlePieSectorClick = (data, index, filterType) => {
//     const sectorName = data.name;

//     let filteredBySector;
//     if (filterType === "status") {
//       filteredBySector = fetchedData.filter(
//         (item) => item.status === sectorName
//       );
//     } else if (filterType === "current_mode") {
//       filteredBySector = fetchedData.filter(
//         (item) => item.current_mode === sectorName
//       );
//     }

//     setFilteredSectorData(filteredBySector);

//     setSelectedSector({ type: filterType, sector: sectorName });
//     setShowSectorTable(true);

//     localStorage.setItem("selectedSector", JSON.stringify(sectorName));
//     localStorage.setItem(
//       "filteredSectorData",
//       JSON.stringify(filteredBySector)
//     );
//   };

//   const stringToColor = (str) => {
//     let hash = 0;
//     for (let i = 0; i < str.length; i++) {
//       hash = str.charCodeAt(i) + ((hash << 5) - hash);
//     }
//     let color = "#";

//     for (let i = 0; i < 3; i++) {
//       const value = (hash >> (i * 8)) & 0xff;

//       color += ("00" + value.toString(16)).substr(-2);
//     }
//     return color;
//   };

//   const renderPieChart = (data) => {
//     if (!pieData || pieData.length === 0) return null;

//     const totalValue = pieData.reduce((sum, entry) => sum + entry.value, 0);

//     const dataWithPercentage = pieData.map((entry) => ({
//       ...entry,
//       percentage: ((entry.value / totalValue) * 100).toFixed(2),
//     }));

//     return (
//       <div
//         className="pie-chart-container"
//         style={{
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           justifyContent: "center",
//           gap: "10px",
//           width: "100%",
//           maxWidth: "600px",
//           margin: "0 auto",
//           marginTop: "10px",
//           padding: "10px",
//         }}
//       >
//         <svg style={{ height: 0 }}>
//           <defs>
//             <filter
//               id="pie-shadow"
//               x="-50%"
//               y="-50%"
//               width="200%"
//               height="200%"
//             >
//               <feDropShadow
//                 dx="6"
//                 dy="8"
//                 stdDeviation="5"
//                 floodColor="black"
//                 floodOpacity="0.3"
//               />
//             </filter>
//             <radialGradient id="slice-gradient" cx="50%" cy="50%" r="50%">
//               <stop offset="0%" stopColor="white" stopOpacity="0.7" />
//               <stop offset="100%" stopColor="#8884d8" />
//             </radialGradient>
//           </defs>
//         </svg>
//         <ResponsiveContainer width="100%" aspect={1}>
//           <PieChart>
//             <Pie
//               data={dataWithPercentage}
//               dataKey="value"
//               nameKey="name"
//               cx="50%"
//               cy="50%"
//               outerRadius="80%"
//               fill="#8884d8"
//               label={(entry) => ` ${entry.value} `}
//               labelLine={{ length: 10, length2: 10 }}
//               onMouseEnter={(data, index) => setHoveredSector(data)}
//               onMouseLeave={() => setHoveredSector(null)}
//               onClick={(data, index) =>
//                 handlePieSectorClick(data, index, "status")
//               }
//             >
//               {dataWithPercentage.map((entry, index) => (
//                 <Cell
//                   key={`cell-${index}`}
//                   fill={stringToColor(entry.name)}
//                   style={{
//                     // filter: "drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.2))",
//                     filter:
//                       "drop-shadow(8px 24px 8px rgba(0.2, 0.2, 0.2, 0.2))",
//                   }}
//                 />
//               ))}
//             </Pie>

//             <Tooltip
//               content={({ active, payload }) => {
//                 if (active && payload && payload.length) {
//                   return (
//                     <div
//                       style={{
//                         background: "white",
//                         padding: "5px",
//                         border: "1px solid #ccc",
//                       }}
//                     >
//                       <strong>{payload[0].name}</strong>: {payload[0].value} (
//                       {payload[0].payload.percentage}%)
//                     </div>
//                   );
//                 }
//                 return null;
//               }}
//             />
//           </PieChart>

//           <div style={{display: "flex",flexWrap: "wrap",marginTop: "0px",paddingTop: "0px", }}
//           >
//             {pieData.map((entry, index) => (
//               <div
//                 key={index}
//                 style={{ display: "flex",alignItems: "center",marginRight: "15px",marginBottom: "5px",
//                 }}
//               >
//                 <div
//                   style={{width: "12px",height: "12px",backgroundColor: stringToColor(entry.name),marginRight: "1px",marginLeft: "35px",
//                   }}
//                 />
//                 <span
//                   style={{ fontSize: "14px", fontWeight: "bold" }}
//                 >{`${entry.name}: ${entry.value} (${entry.percentage}%)`}</span>
//               </div>
//             ))}
//           </div>
//         </ResponsiveContainer>
//       </div>
//     );
//   };

//   const calculateModeData = (filtered) => {
//     if (!filtered || filtered.length === 0) return []; 
//     const modeCounts = filtered.reduce((acc, item) => {
//       acc[item.current_mode] = (acc[item.current_mode] || 0) + 1;
//       return acc;
//     }, {});

//     const totalItems = filtered.length;

//     const modeDetails = Object.keys(modeCounts).map((key) => ({
//       name: key,
//       value: modeCounts[key],
//       percentage: ((modeCounts[key] / totalItems) * 100).toFixed(2),
//     }));

//     setModeDataDetails(modeDetails);
//     localStorage.setItem("modeDataDetails", JSON.stringify(modeDetails));
//   };

//   useEffect(() => {
//     const storedDate = localStorage.getItem("selectedDate");
//     const storedChart = localStorage.getItem("selectedChart");
//     if (storedDate) setDisplayedDate(storedDate);
//     if (storedChart) setDisplayedChart(storedChart);

//     const storedPieData = JSON.parse(localStorage.getItem("pieData"));
//     if (storedPieData) setPieData(storedPieData);

//     const storedModeData = JSON.parse(localStorage.getItem("modeDataDetails"));
//     if (storedModeData) setModeDataDetails(storedModeData);
//   }, []);

//   const generateCurrentModeColor = (index, total) => {
//     const hue = (index / total) * 360;
//     return `hsl(${hue}, 70%, 50%)`;
//   };

//   const renderModePieChart = () => {
//     console.log("modedatadetails", modeDataDetails);
//     const totalValue = modeDataDetails.reduce(
//       (sum, entry) => sum + entry.value,
//       0
//     );

//     let rawPercentages = pieData.map(
//       (entry) => (entry.value / totalValue) * 100
//     );

//     let roundedPercentages = rawPercentages.map(
//       (percent) => Math.round(percent * 100) / 100
//     );
//     let roundedTotal = roundedPercentages.reduce(
//       (sum, percent) => sum + percent,
//       0
//     );

//     let difference = 100 - roundedTotal;
//     roundedPercentages[roundedPercentages.length - 1] += difference;

//     const dataWithPercentage = modeDataDetails.map((entry) => ({
//       ...entry,
//       percentage: ((entry.value / totalValue) * 100).toFixed(2),
//     }));

//     return (
//       <div
//         className="pie-chart-container"
//         style={{
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           justifyContent: "center",
//           gap: "10px",

//           marginTop: "30px",
//           padding: "10px",
//           width: "100%",
//           maxWidth: "600px",
//           margin: "0 auto",
//         }}
//       >
//         <svg style={{ height: 0 }}>
//           <defs>
//             <filter
//               id="pie-shadow"
//               x="-50%"
//               y="-50%"
//               width="200%"
//               height="200%"
//             >
//               <feDropShadow
//                 dx="6"
//                 dy="8"
//                 stdDeviation="5"
//                 floodColor="black"
//                 floodOpacity="0.3"
//               />
//             </filter>
//             <radialGradient id="slice-gradient" cx="50%" cy="50%" r="50%">
//               <stop offset="0%" stopColor="white" stopOpacity="0.7" />
//               <stop offset="100%" stopColor="#8884d8" />
//             </radialGradient>
//           </defs>
//         </svg>

//         <ResponsiveContainer width="100%" aspect={1}>
//           <PieChart>
//             <Pie
//               data={dataWithPercentage}
//               dataKey="value"
//               nameKey="name"
//               cx="50%"
//               cy="50%"
//               outerRadius="80%"
//               fill="#8884d8"
//               label={(entry) => ` ${entry.value}`}
//               onClick={(data, index) =>
//                 handlePieSectorClick(data, index, "current_mode")
//               }
//             >
//               {dataWithPercentage.map((entry, index) => (
//                 <Cell
//                   key={`cell-${index}`}
//                   fill={generateCurrentModeColor(
//                     index,
//                     dataWithPercentage.length
//                   )}
//                   style={{
//                     // filter: "drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.2))",
//                     filter:
//                       "drop-shadow(8px 24px 8px rgba(0.2, 0.2, 0.2, 0.2))",
//                   }}
//                 />
//               ))}
//             </Pie>
//             <Tooltip
//               content={({ active, payload }) => {
//                 if (active && payload && payload.length) {
//                   return (
//                     <div
//                       style={{
//                         background: "white",
//                         padding: "5px",
//                         border: "1px solid #ccc",
//                       }}
//                     >
//                       <strong>{payload[0].name}</strong>: {payload[0].value} (
//                       {payload[0].payload.percentage}%)
//                     </div>
//                   );
//                 }
//                 return null;
//               }}
//             />
//           </PieChart>

//           <div
//             style={{
//               display: "flex",
//               flexWrap: "wrap",
//               marginTop: "-10px",
//               paddingTop: "0px",
//             }}
//           >
//             {dataWithPercentage.map((entry, index) => (
//               <div
//                 key={index}
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   marginRight: "15px",
//                   marginBottom: "5px",
//                 }}
//               >
//                 <div
//                   style={{
//                     width: "12px",
//                     height: "12px",
//                     backgroundColor: generateCurrentModeColor(
//                       index,
//                       dataWithPercentage.length
//                     ),
//                     marginRight: "5px",
//                     marginLeft: "30px",
//                   }}
//                 />
//                 <span
//                   style={{ fontSize: "14px", fontWeight: "bold" }}
//                 >{`${entry.name}: ${entry.value} (${entry.percentage}%)`}</span>
//               </div>
//             ))}
//           </div>
//         </ResponsiveContainer>
//       </div>
//     );
//   };

//   const renderSectorTable = () => {
//     if (!filteredSectorData || filteredSectorData.length === 0) {
//       return <div>No data available</div>;
//     }

//     const columns = Object.keys(filteredSectorData[0])
//       .map((key, index) => ({
//         title: key.charAt(0).toUpperCase() + key.slice(1),
//         dataIndex: key,
//         key: key,
//         width: 150,
//         fixed: index < 2 ? "left" : null,
//       }))
//       .filter((column) => column.key !== "mode_logs");
//     return (
//       <Table
//         className="custom-table"
//         columns={columns}
//         dataSource={filteredSectorData}
//         rowKey={(record) => record.id || Math.random()}
//         pagination={false}
//         style={{ width: "80%", marginTop: "20px" }}
//         scroll={{ x: "max-content", y: 400 }}
//       />
//     );
//   };

//   useEffect(() => {
//     const storedSelectedChart = localStorage.getItem("selectedChart");
//     const storedFilteredData = JSON.parse(localStorage.getItem("tableData"));
//     const storedBarData = JSON.parse(localStorage.getItem("barData"));

//     if (storedSelectedChart) setSelectedChart(storedSelectedChart);
//     if (storedFilteredData) setFilteredData(storedFilteredData);
//     if (storedBarData) setBarData(storedBarData);
//   }, []);

//   const handleExport = (fileName) => {
//     if (filteredSectorData.length > 0) {
//       Export_to_Excel(filteredSectorData, fileName);
//     }
//   };

//   return (
//     <div className="reports-container">
//       <Row justify="center" style={{ marginTop: "8px", marginBottom: "35px" }}>
//         <Col>
//           <label style={{ marginRight: 8, marginBottom: "10px" }}>
//             Report Type:
//           </label>
//           <Dropdown overlay={reportTypesMenu}>
//             <Button>
//               {selectedReportType ? selectedReportType : "Select Report Type"}{" "}
//               <DownOutlined />
//             </Button>
//           </Dropdown>
//         </Col>
//       </Row>

//       {isReportTypeSelected && selectedReportType === "Done Report" && (
//         <DoneReport />
//       )}

//       {isReportTypeSelected && selectedReportType === "Productivity Report" && (
//         <ProductivityReport />
//       )}

//       {isReportTypeSelected && selectedReportType === "Bidding Summary" && (
//         <ProjectBidSummary />
//       )}

//       {isReportTypeSelected && selectedReportType === "Employee DashBoard" && (
//         <div style={{ padding: 24 }}>
//           <div
//             style={{
//               display: "flex",
//               flexDirection: "row",
//               justifyContent: "center",
//             }}
//           >
//             <div style={{ marginBottom: 16 }}>
//               <label style={{ marginRight: 8 }}> Select Date: </label>
//               <DatePicker
//                 onChange={handleDateChange}
//                 value={selectedDate ? dayjs(selectedDate) : null}
//                 format="YYYY-MM-DD"
//                 allowClear
//               />
//             </div>

//             <div style={{ marginBottom: 16, marginLeft: 16 }}>
//               <label style={{ marginRight: 8 }}>Select Chart: </label>
//               <Dropdown overlay={chartTypesMenu}>
//                 <Button>
//                   {selectedChart ? selectedChart : "Select Chart"}{" "}
//                   <DownOutlined />
//                 </Button>
//               </Dropdown>
//             </div>

//             <div style={{ marginBottom: 16, marginLeft: 1 }}>
//               <Button
//                 type="primary"
//                 onClick={handleGetData}
//                 disabled={!selectedDate || !selectedChart}
//               >
//                 Get Data
//               </Button>
//             </div>
//           </div>

//           {showTable && displayedChart === "Table" && jsonData.length > 0 && (
//             <>
//               <div
//                 className="download_button_container"
//                 style={{ display: "flex", justifyContent: "flex-start" }}
//               >
//                 <Button
//                   type="primary"
//                   className="download_button"
//                   onClick={() => handleDownload(dynamicColumns, jsonData)}
//                   style={{ marginBottom: 16, marginLeft: "auto" }}
//                 >
//                   Export Excel
//                 </Button>
//               </div>

//               <Table
//                 className="custom-table"
//                 dataSource={jsonData}
//                 columns={dynamicColumns}
//                 rowKey={(item, index) => index}
//                 style={{ marginTop: 24 }}
//                 scroll={{ x: 4500, y: 400 }}
//               />
//             </>
//           )}

//           {displayedChart === "PieChart" && pieData.length > 0 && (
//             <div
//               style={{display: "flex",flexDirection: "row",justifyContent: "center",aligItems: "center",gap: "10px",
//                 marginTop: "20px",
//               }}
//             >
//               <div
//                 style={{display: "flex",flexDirection: "column",justifyContent: "center",alignItems: "center",
//                   width: "45%",
//                 }}
//               >
//                 <h3
//                   style={{ textAlign: "center", marginRight: "100px", marginBottom: "3px",marginTop: "50px",
//               textDecoration: "underline",
//                     fontSize: "22px",
//                   }}
//                 >
//                   Status Distribution
//                 </h3>

//                 <button
//                   className="Export_status_pie_button"
//                   onClick={() => handleExport("Status_Distribution")}
//                   disabled={selectedSector.type !== "status"}
//                 >
//                   Export Selected
//                 </button>
//                 {renderPieChart()}
//               </div>
//               <div>
//                 <button
//                   className="Export_all_button"
//                   onClick={() => handleExportAll(fetchedData)}
//                 >
//                   Export All
//                 </button>
//               </div>
//               <div
//                 style={{
//                   display: "flex",
//                   flexDirection: "column",
//                   justifyContent: "center",
//                   alignItems: "center",
//                   width: "45%",
//                   marginTop: "20px",
//                 }}
//               >
//                 <h3
//                   style={{
//                     textAlign: "center",
//                     marginRight: "100px",
//                     marginBottom: "10px",
//                     marginTop: "12px",
//                     textDecoration: "underline",
//                     fontSize: "22px",
//                   }}
//                 >
//                   Current Mode Distribution
//                 </h3>
//                 <button
//                   className="Export_mode_pie_button"
//                   disabled={selectedSector.type !== "current_mode"}
//                   onClick={() => handleExport("Mode_Distribution")}
//                 >
//                   Export Selected
//                 </button>
//                 {renderModePieChart()}
//               </div>
//             </div>
//           )}

//           {displayedChart === "PieChart" &&
//             showSectorTable &&
//             filteredSectorData.length > 0 && (
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "center",
//                   marginTop: "30px",
//                 }}
//               >
//                 {renderSectorTable()}
//               </div>
//             )}

//           {displayedChart === "BarGraph" && barData && (
//             <div
//               style={{
//                 display: "flex",
//                 flexDirection: "row",
//                 justifyContent: "center",
//                 gap: "30px",
//               }}
//             >
//               {barData.statusBarData &&
//                 renderBarChart(barData.statusBarData, "Status Distribution", 0)}
//               {barData.modeBarData &&
//                 renderBarChart(
//                   barData.modeBarData,
//                   "Current Mode Distribution",
//                   180
//                 )}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Reports;
