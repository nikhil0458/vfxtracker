import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Dropdown,
  Menu,
  Button,
  message,
  Table,
  Alert,
  Row,
  Col,
  DatePicker,
  Carousel,
} from "antd";
import { DownOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
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
import {
  PieChart,
  BarChart,
  Pie,
  Tooltip,
  Cell,
  XAxis,
  YAxis,
  Bar,
  ResponsiveContainer,
  Legend,
} from "recharts";
import dayjs from "dayjs";
import ProjectBidSummary from "./ProjectBidSummary";
import DailyReport from "./DailyReport";
import handleDownload from "./tableReportsHandleDownload";
import handleExportAll from "./pieReportsHandleExportAll";
import Export_to_Excel from "./pieReportsExportSelected";
import renderBarChart from "./reportsRenderBarChart";


import { Resizable } from "react-resizable";
import "react-resizable/css/styles.css";


// const  ResizableTitle = (props) => {
//   const { onResize, onResizeStop, width, ...restProps } = props;
//   if (!width) return <th {...restProps} />;

//   return (
//     <Resizable
//       width={width}
//       height={0}
//       handle={
//         <span
//           className="react-resizable-handle"
//           onClick={(e) => e.stopPropagation()}
//           style={{
//             position: "absolute",
//             right: -5,
//             top: 0,
//             bottom: 0,
//             width: 10,
//             cursor: "col-resize",

//             ZIndex: 1,
//           }}
//         />
//       }
//       onResize={onResize}
//       onResizeStop={onResizeStop}
//       draggableOpts={{ enableUserSelectHack: false, grid: [1, 1] }}
//     >

//       <th {...restProps} />
//     </Resizable>
//   );
// };






const Reports = () => {
  const { accessToken, user, designation  } = useAuth();

  const [options, setOptions] = useState([]);

  const [selectedReportType, setSelectedReportType] = useState(
    localStorage.getItem("reportSelectedOption") || null
  );
  const [isReportTypeSelected, setIsReportTypeSelected] = useState(false);

  const [selectedOption, setSelectedOption] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  // const [tableLoading, setTableLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState();

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


// const [filterOfFilterDashboardData, isFilterOfFilterDashboardData] = useState([]);









  const carouselRef = useRef(null);

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
    const savedChart = localStorage.getItem("selectedChart");

    if (savedChart) {
      setSelectedChart(savedChart);
    }

    // ✅ Wait for selectedChart to be set before setting showTable
    setTimeout(() => {
      const savedShowTable = localStorage.getItem("showTable");
      if (savedShowTable !== null && savedChart === "Table") {
        setShowTable(JSON.parse(savedShowTable));
      }
    }, 100);
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
      console.log("selectedchartatpresent", selectedChart);
    }
  }, [selectedChart]);

  useEffect(() => {
    const storedSectorTableData = localStorage.getItem("filteredSectorData");
    const storedSectorShowTable = localStorage.getItem("showSectorTable");
    const storedSelectedSector = localStorage.getItem("selectedSector");

    console.log("Restoring Sector Table...");
    console.log("Stored Filtered Data:", storedSectorTableData);
    console.log("Stored Show Sector Table:", storedSectorShowTable);
    console.log("Stored Selected Sector:", storedSelectedSector);

    if (storedSelectedSector) {
      const selectedSectorData = JSON.parse(storedSelectedSector);
      setSelectedSector(selectedSectorData);

      const restoredSectorData = fetchedData.filter((item) =>
        selectedSectorData.type === "status"
          ? item.status === selectedSectorData.sector
          : item.current_mode === selectedSectorData.sector
      );

      console.log("Restored Sector Data After Refresh:", restoredSectorData);
      setFilteredSectorData(restoredSectorData);

      setTimeout(() => {
        setShowSectorTable(true);
        console.log("Sector Table Visibility Restored:", true);
      }, 300);
    }
  }, [fetchedData]); // ✅ Ensures it runs AFTER `fetchedData` is available

  useEffect(() => {
    if (filteredSectorData.length > 0) {
      console.log("saving filtered sector data", filteredSectorData);
      localStorage.setItem(
        "filteredSectorData",
        JSON.stringify(filteredSectorData)
      );
      localStorage.setItem("showSectorTable", JSON.stringify(true));
    } else {
      localStorage.removeItem("filteredSectorData");
      localStorage.setItem("showSectorTable", JSON.stringify(false));
    }
  }, [filteredSectorData]);

  useEffect(() => {
    const savedTableData = localStorage.getItem("tableData");
    const savedShowTable = localStorage.getItem("showTable");

    if (savedTableData) {
      const parsedData = JSON.parse(savedTableData);
      if (parsedData.length > 0) {
        setJsonData(parsedData);
        setFetchedData(parsedData);

        const dynamicCols = Object.keys(parsedData[0] || {}).map(
          (key, index) => ({
            title: key.replace(/_/g, " ").toUpperCase(),
            dataIndex: key,
            key: key,
            fixed: index < 2,
            filters: [
              ...Array.from(new Set(parsedData.map((item) => item[key]))).map(
                (value) => ({
                  text: value,
                  value: value,
                })
              ),
            ],
            onFilter: (value, record) => (record[key] = value),
            sorter: (a, b) => {
              if (typeof a[key] === "number") {
                return a[key] - b[key];
              } else if (typeof a[key] === "string") {
                return a[key].localeCompare(b[key]);
              }
              return 0;
            },
          })
        );

        setDynamicColumns(dynamicCols);

        setTimeout(() => {
          setShowTable(true);
        }, 200);
      }
    }

    if (savedShowTable !== null) {
      // setShowTable(JSON.parse(savedShowTable));

      setTimeout(() => {
        setShowTable(JSON.parse(savedShowTable));
      }, 200);
    }
  }, []);

  useEffect(() => {
    if (jsonData.length > 0 && selectedChart === "Table") {
      localStorage.setItem("tableData", JSON.stringify(jsonData));
      // localStorage.setItem("showTable", JSON.stringify(true));

      setTimeout(() => {
        setShowTable(true);
        console.log("Final showTable after data restore:", true);
      }, 300);
    } else if (selectedChart !== "Table") {
      localStorage.removeItem("tableData"); // ✅ Remove stored data if empty
      localStorage.setItem("showTable", JSON.stringify(false));
    }
  }, [jsonData, selectedChart]);

  useEffect(() => {
    if (selectedSector?.sector) {
      const restoredSectorData = fetchedData.filter((item) =>
        selectedSector.type === "status"
          ? item.status === selectedSector.sector
          : item.current_mode === selectedSector.sector
      );

      console.log("Restored Sector Data After Refresh:", restoredSectorData);
      setFilteredSectorData(restoredSectorData);

      // setShowSectorTable(true);
      setTimeout(() => {
        setShowSectorTable(true);
      }, 300);
    }
  }, [selectedSector, fetchedData]);

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

  useEffect(() => {
    if (fetchedData.length > 0) {
      localStorage.setItem("fetchedData", JSON.stringify(fetchedData));
      console.log("Saving fetchedData to localStorage:", fetchedData);
    }
  }, [fetchedData]);

  useEffect(() => {
    console.log("Fetched Data after Refresh:", fetchedData);
  }, [fetchedData]);

  const fetchLoginLogs = async (dateToUse) => {
    try {
      const response = await axios.get(
        `http://${ip_port}/login_logs_with_offline_users/?date=${dateToUse}`
      );

      const data = await response.data;
    
      const shotLogsList = data.map((row) => {
        try {
          const parsed = JSON.parse(row.shot_logs);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          console.warn("Invalid JSON in shot_logs for row:", row);
          return [];
        }
      });
      

      console.log("non-filtered-data", data);

      console.log("All parsed shot logs (per row):", shotLogsList);

   
     

    //  let  filteredIdData = data.map(
     let  filteredIdData = data.map(
        ({ _id, mode_logs,...rest 
          }) =>
           
            
         rest,
        //  parsed_shot_logs,
            
    );
    
    
      console.log("userControls", user.controls)
      if (designation === "Team Leader"){
        filteredIdData = filteredIdData.filter(obj =>
          user.controls.some(dept => dept.toLowerCase() === obj.department.toLowerCase())
        );

      }
      console.log("data", filteredIdData);

      if (filteredIdData.length > 0) {
        
        setJsonData(filteredIdData);
        setFetchedData(filteredIdData);
        setShowTable(true);

        // ✅ Store the latest data in localStorage
        localStorage.setItem("tableData", JSON.stringify(filteredIdData));
        localStorage.setItem("showTable", JSON.stringify(true));
      } else {
        setShowTable(false);
        setJsonData([]);
        setFetchedData([]);

        // ✅ Clear storage when no data is present
        localStorage.removeItem("tableData");
        localStorage.setItem("showTable", JSON.stringify(false));
      }

      // ✅ Ensure dynamic columns are generated correctly
      if (filteredIdData.length > 0) {
        console.log("filteredIdData", filteredIdData);
        let dynamicColumns = Object.keys(filteredIdData[0])
          .map((key, index) => ({
            title: key.replace(/_/g, " ").toUpperCase(),
            dataIndex: key,
            key: key,
            fixed: index < 2,
            filters: [
              ...Array.from(
                new Set(filteredIdData.map((item) => item[key]))
              ).map((value) => ({
                text: value,
                value: value,
              })),
            ],
            onFilter: (value, record) => (record[key] = value),
            sorter: (a, b) => {
              if (typeof a[key] === "number") {
                return a[key] - b[key];
              } else if (typeof a[key] === "string") {
                return a[key].localeCompare(b[key]);
              }
              return 0;
            },
          }))
          .filter((dynamiccolumn) => dynamiccolumn.key !== "mode_logs");

        setDynamicColumns(dynamicColumns);
      }
      localStorage.setItem("tableData", JSON.stringify(filteredIdData));
      localStorage.setItem("dynamicColumns", JSON.stringify(dynamicColumns));
      localStorage.setItem("showTable", JSON.stringify(true));
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

      localStorage.setItem("selectedDate", formattedDate);
      setShowTable(false)


    }
  };

  const handleChartTypeChange = (e) => {
    if (e.key === "select") {
      console.log("selectedOption", e.key);

      message.info("No chart selected.");
    } else {
      setSelectedChart(e.key);
      localStorage.setItem("selectedOption", e.key);

      if (e.key !== "Table") {
        setJsonData([]);
        setFetchedData([]);
        setPieData([]);
        setModeDataDetails([]);
        setBarData([]);
        setShowTable(false);
        // setShowSectorTable(false);

        if (e.key !== "PieChart") {
          setShowSectorTable(false);
          localStorage.setItem("showSectorTable", JSON.stringify(false));
        }

        localStorage.setItem("selectedChart", e.key);

        // ✅ Clear stored data
        localStorage.removeItem("tableData");
        localStorage.removeItem("filteredSectorData");
        localStorage.removeItem("showSectorTable");
        localStorage.removeItem("pieData");
        localStorage.removeItem("modeDataDetails");
        localStorage.removeItem("barData");
        localStorage.setItem("showTable", JSON.stringify(false));
      }
    }
  };

  const chartTypesMenu = (
    <Menu
      onClick={handleChartTypeChange}
      style={{ maxHeight: "none" }}
      // style={{ maxHeight: "80px", overflowY: "auto" }}
    >
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
      console.log("chartToUse", chartToUse);

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
          console.log("Fetched Data:", Data);

          if (!Data || !Array.isArray(Data)) {
            console.error("Error: Data is undefined or not an array:", Data);
            // setShowTable(false);
            setTimeout(() => {
              setShowTable(false);
              console.log("Setting showTable to false due to invalid data");
            }, 200);

            setShowSectorTable(false);
            setJsonData([]);
            setFetchedData([]);
            localStorage.setItem("showTable", JSON.stringify(false));
            localStorage.setItem("showSectorTable", JSON.stringify(false));
            return;
          }

          if (Data.length === 0) {
            // setShowTable(false);

            setTimeout(() => {
              setShowTable(false);
              console.log("Setting showTable to false due to empty data");
            }, 200);
            setShowSectorTable(false);
            localStorage.setItem("showTable", JSON.stringify(false));
            localStorage.setItem("showSectorTable", JSON.stringify(false));
            setJsonData([]);
            setFetchedData([]);
          } else {
            if (chartToUse === "Table") {
              setJsonData(Data);
              setFetchedData(Data);
              // setShowTable(true);

              setTimeout(() => {
                setShowTable(true);
                console.log("showTable set to true after data is set");
              }, 300);
              localStorage.setItem("tableData", JSON.stringify(Data));
              localStorage.setItem("showTable", JSON.stringify(true));
            } else if (chartToUse === "PieChart") {
              setShowTable(false);
              // localStorage.setItem("showTable", JSON.stringify(false));

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

              setPieData(pieData);
              localStorage.setItem("pieData", JSON.stringify(pieData));

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

              calculateModeData(Data);
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
            // localStorage.setItem("tableData", JSON.stringify(filteredData));
            localStorage.setItem("selectedChart", selectedChart);
          }
        })

        .finally(() => setLoading(false));
    }, 50),
    [selectedDate, selectedChart]
  );

  useEffect(() => {
    const savedPieData = localStorage.getItem("pieData");
    const savedModeData = localStorage.getItem("modeDataDetails");
    const savedSectorData = localStorage.getItem("filteredSectorData");
    const savedSectorTableVisibility = localStorage.getItem("showSectorTable");
    const savedSelectedSector = localStorage.getItem("selectedSector");

    if (savedPieData) setPieData(JSON.parse(savedPieData));
    if (savedModeData) setModeDataDetails(JSON.parse(savedModeData));

    // Restore Sector Table and Selected Sector
    if (savedSectorData) setFilteredSectorData(JSON.parse(savedSectorData));
    if (savedSectorTableVisibility)
      setShowSectorTable(JSON.parse(savedSectorTableVisibility));
    if (savedSelectedSector) setSelectedSector(JSON.parse(savedSelectedSector));
  }, []);

  useEffect(() => {
    const savedSectorData = localStorage.getItem("filteredSectorData");
    const savedSectorTableVisibility = localStorage.getItem("showSectorTable");
    const savedSelectedSector = localStorage.getItem("selectedSector");

    console.log("Restoring Sector Table...");
    console.log("Stored Filtered Data:", savedSectorData);
    console.log("Stored Show Sector Table:", savedSectorTableVisibility);
    console.log("Stored Selected Sector:", savedSelectedSector);

    // ✅ Prevent restoring before `fetchedData` is available
    if (!fetchedData || fetchedData.length === 0) {
      console.warn(
        "Waiting for fetchedData to load before restoring sector table..."
      );
      return;
    }

    if (savedSelectedSector) {
      const selectedSectorData = JSON.parse(savedSelectedSector);
      setSelectedSector(selectedSectorData);

      const restoredSectorData = fetchedData.filter((item) =>
        selectedSectorData.type === "status"
          ? item.status === selectedSectorData.sector
          : item.current_mode === selectedSectorData.sector
      );

      console.log("Restored Sector Data After Refresh:", restoredSectorData);
      setFilteredSectorData(restoredSectorData);

      setTimeout(() => {
        setShowSectorTable(true);
        console.log("Sector Table Visibility Restored:", true);
      }, 300);
    }
  }, [fetchedData]); // ✅ Ensures this only runs AFTER `fetchedData` is loaded

  useEffect(() => {
    if (pieData.length) {
      localStorage.setItem("pieData", JSON.stringify(pieData));
    }
  }, [pieData]);

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

    // const savedTableData = localStorage.getItem("tableData");
    const savedChart = localStorage.getItem("selectedChart");
    if (savedDate) setSelectedDate(savedDate);
    if (savedChart) setSelectedChart(savedChart);

    if (savedChart === "Table") {
      const savedTableData = localStorage.getItem("tableData");
      if (savedTableData && savedTableData !== "null") {
        setJsonData(JSON.parse(savedTableData));
        setShowTable(true);
      }
    }
  }, []);

  // useEffect(() => {
  //   const savedDate = localStorage.getItem("selectedDate");
  //   const savedChart = localStorage.getItem("selectedChart");

  //   if (savedDate) setSelectedDate(savedDate);
  //   if (savedChart) setSelectedChart(savedChart);

  //   // Automatically fetch data when the page refreshes
  //   if (savedDate && savedChart === "PieChart") {
  //     handleGetData();
  //   }
  // }, []);

  useEffect(() => {
    const savedSectorData = localStorage.getItem("filteredSectorData");
    const savedSectorTableVisibility = localStorage.getItem("showSectorTable");
    const savedSelectedSector = localStorage.getItem("selectedSector");

    console.log("Restoring Sector Table...");
    console.log("Stored Filtered Data:", savedSectorData);
    console.log("Stored Show Sector Table:", savedSectorTableVisibility);
    console.log("Stored Selected Sector:", savedSelectedSector);

    if (savedSectorData && savedSectorData !== "null") {
      setFilteredSectorData(JSON.parse(savedSectorData));
    }

    if (savedSelectedSector && savedSelectedSector !== "null") {
      setSelectedSector(JSON.parse(savedSelectedSector));
    }

    setTimeout(() => {
      if (savedSectorTableVisibility && savedSectorTableVisibility !== "null") {
        setShowSectorTable(JSON.parse(savedSectorTableVisibility));
      }
    }, 300);
  }, []);

  useEffect(() => {
    const savedChart = localStorage.getItem("selectedChart");

    const savedTableData = localStorage.getItem("tableData");
    const savedShowTable = localStorage.getItem("showTable");

    if (savedChart) {
      setSelectedChart(savedChart);
    }

    // if (savedTableData && savedTableData !== "null") {
    if (savedTableData && savedChart === "Table") {
      const parsedData = JSON.parse(savedTableData);
      if (parsedData.length > 0) {
        setJsonData(parsedData);
        setFetchedData(parsedData);

        setTimeout(() => {
          setShowTable(true);
          console.log("Restoring table from storage - showTable set to true");
        }, 200);
      }
    }

    if (savedShowTable !== null && savedChart === "Table") {
      setTimeout(() => {
        setShowTable(JSON.parse(savedShowTable));
        console.log("Restored showTable:", JSON.parse(savedShowTable));
      }, 300);
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
    "Daily Report",
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
    <Menu
      onClick={handleReportTypeChange}
      // style={{ maxHeight: "80px", overflowY: "auto" }}
      style={{ maxHeight: "none" }}
      // style={{ maxHeight: "80px", overflowY: "auto" }}
    >
      {reportTypes.map((type) => (
        <Menu.Item key={type}>{type}</Menu.Item>
      ))}
    </Menu>
  );

  const handlePieSectorClick = (data, index, filterType) => {
    if (!fetchedData || fetchedData.length === 0) {
      console.warn("Clicked sector before data was loaded. Ignoring...");
      return;
    }
    const sectorName = data.name;

    console.log("Clicked Sector:", sectorName);
    console.log("Fetched Data:", fetchedData);

    let filteredBySector = fetchedData.filter((item) =>
      filterType === "status"
        ? item.status === sectorName
        : item.current_mode === sectorName
    );

    console.log("Filtered Data After Click:", filteredBySector);

    setFilteredSectorData(filteredBySector);
    setSelectedSector({ type: filterType, sector: sectorName });

    setTimeout(() => {
      setShowSectorTable(true);
      console.log("Sector Table Should Now Be Visible");
    }, 200);

    localStorage.setItem(
      "selectedSector",
      JSON.stringify({ type: filterType, sector: sectorName })
    );
    localStorage.setItem(
      "filteredSectorData",
      JSON.stringify(filteredBySector)
    );
    localStorage.setItem("showSectorTable", JSON.stringify(true));
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
    console.log("colorstring", color);
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
                        // background: "white",
                        padding: "5px",
                        border: "1px solid #ccc",
                      }}
                    >
                      <strong style={{fontSize:"18px", fontWeight: "bold"}}>{payload[0].name}</strong>: {payload[0].value} (
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
              marginTop: "0px",
              paddingTop: "0px",
            }}
          >
            {pieData.map((entry, index) => (
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
                    backgroundColor: stringToColor(entry.name),
                    marginRight: "1px",
                    marginLeft: "35px",
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
                        // background: "white",
                      
                        
                        padding: "5px",
                        border: "1px solid #ccc",
                      }}
                    >
                      <strong  style={{fontSize:"18px", fontWeight:"bold"}}>{payload[0].name}</strong>: {payload[0].value} (
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
 

  const getStoredTableState = () => {
    const storedState = localStorage.getItem("sectorReportTableState");
    return storedState ? JSON.parse(storedState) : {};
  };

  const storedState = getStoredTableState();

  const [tableParams, setTableParams] = useState({
    pagination: storedState.pagination || { pageSize: 10 },
    filters: storedState.filters || {},
    sorter: storedState.sorter || {},
  });
  // const enhancedSectorReportColumns = columns.map((col) => ({
  //   ...col,
  //   sorter: (a, b) => (a[col.dataIndex] > b[col.dataIndex] ? 1 : -1),
  //   sortOrder:
  //     tableParams.sorter?.columnKey === col.dataIndex
  //       ? tableParams.sorter.order
  //       : null,
  //   filters: [
  //     ...new Set(filteredSectorData.map((item) => item[col.dataIndex])),
  //   ].map((value) => ({
  //     text: value,
  //     value,
  //   })),
  //   filteredValue: tableParams.filters?.[col.dataIndex] || null,
  //   onFilter: (value, record) => record[col.dataIndex] === value,
  // }));






  const handleTableChange = (pagination, filters, sorter) => {
    const newState = {
      pagination,
      filters,
      sorter: sorter.columnKey ? sorter : {},
    };
    setTableParams(newState);
    localStorage.setItem("sectorReportTableState", JSON.stringify(newState));
  };





  const renderSectorTable = () => {
    console.log("Rendering Sector Table...");
    console.log("Show Sector Table:", showSectorTable);
    console.log("Filtered Sector Data:", filteredSectorData);
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
        filters: [
          ...Array.from(new Set(filteredSectorData.map((item)=> item[key]))).map(
            (value)=> ({
              text: value,
              value: value,
            })
          ),
      ],
      filterSearch: true,
      onFilter: (value, record) => record[key] === value,
      sorter: (a,b) => {
        if (typeof a[key] === "number") {
          return a[key] - b[key];

        } else if (typeof a[key] === "string") {
          return a[key].localeCompare(b[key]);
        }
        return 0;
      },
        
      }))

      .filter((column) => column.key !== "mode_logs");
    return (
      <Table

     
        
        className="custom-table"
      
        
        columns={columns}
        dataSource={filteredSectorData}
        rowKey={(record) => record.id || Math.random()}
        pagination={false}
        style={{ width: "100vw", marginTop: "20px" }}
        scroll={{ x: "max-content", y: 400 }}
       
        onChange={handleTableChange}
        sticky

      />
    );
  };

  useEffect(() => {
    const storedSelectedChart = localStorage.getItem("selectedChart");
    // const storedFilteredData = JSON.parse(localStorage.getItem("tableData"));
    const storedBarData = JSON.parse(localStorage.getItem("barData"));

    if (storedSelectedChart) setSelectedChart(storedSelectedChart);
    // if (storedFilteredData) setFilteredData(storedFilteredData);
    if (storedBarData) setBarData(storedBarData);
  }, []);

  const handleExport = (fileName) => {
    if (filteredSectorData.length > 0) {
      Export_to_Excel(filteredSectorData, fileName);
    }
  };

  return (
    <div className="reports-container">
      <Row justify="center" style={{ marginTop: "3px", marginBottom: "45px" }}>
        <Col>
          <label style={{ marginRight: 11, marginBottom: "10px" }}>
            Report Type:
          </label>
          <Dropdown
            className="reports_dropdown"
            overlay={reportTypesMenu}
            // placement="Right"
            overlayStyle={{ maxHeight: "none", overflow: "visible" }}
            trigger={["click"]}
          >
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
      {isReportTypeSelected && selectedReportType === "Daily Report" && (
        <DailyReport />
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
              <label style={{ marginRight: 11 }}>Select Chart: </label>
              <Dropdown
                overlay={chartTypesMenu}
                // placement="Right"
                overlayStyle={{ maxHeight: "none", overflow: "visible" }}
              >
                <Button>
                  {selectedChart ? selectedChart : "Select Chart"}{" "}
                  <DownOutlined />
                </Button>
              </Dropdown>
            </div>

            <div style={{ marginBottom: 16, marginLeft: 9 }}>
              <Button
                type="primary"
                onClick={handleGetData}
                disabled={!selectedDate || !selectedChart}
              >
                Show Table
              </Button>
            </div>
          </div>

          {/* {showTable && displayedChart === "Table" && jsonData.length > 0 && ( */}
          {showTable && jsonData.length > 0 && displayedChart === "Table" && (
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
              {dynamicColumns.length > 0 ? (
                <div className="scrollable-table-wrapper">
                <Table


                  className="custom-table"
                  dataSource={jsonData}
                  columns={dynamicColumns}
                  rowKey={(item, index) => index}
                  pagination={false}
                  // style={{ marginTop: 24 }}
                  // scroll={{ x: 4500, y: 400 }}
                  scroll={{ x: 4500, y:'calc(100vh - 450px)' }}
                  // sticky={{ offsetHeader: 0 }}
                  // scroll={{ x: '100%', y: 'calc(100vh - 450px)' }}
                />
                </div>
              ) : (
                <p style={{ textAlign: "center", fontSize: "16px" }}>
                  Loading data...
                </p>
              )}
            </>
          )}

          {displayedChart === "PieChart" && pieData.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                aligItems: "center",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "45%",
                }}
              >
                <h3
                  style={{
                    textAlign: "center",
                    marginRight: "100px",
                    marginBottom: "3px",
                    marginTop: "50px",
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

          {/* Slide 1: Status Distribution Bar Graph */}
        </div>
      )}
    </div>
  );
};

export default Reports;
