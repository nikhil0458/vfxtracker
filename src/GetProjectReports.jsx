import React, { useEffect, useState } from "react";
import { ip_port } from "./Configs";
import { useAuth } from "./AuthContext";
// import { ip_port } from "./Configs";
import "./ProjectReports.css";
import axios from "axios";
import {
  Dropdown,
  Menu,
  Button,
  message,
  Spin,
  Table,
  Modal,
  Input,
  notification,
} from "antd";
import exportToExcel from "./exportToExcel";
import handleDownload from "./handleDownload";

// import ExcelJS from "exceljs";
// import { saveAs } from "file-saver";

const GetProjectReports = ({ darkTheme }) => {
  const { accessToken } = useAuth();
  const [projectList, setProjectList] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");

  const [option, setOption] = useState("");
  const [data, setData] = useState([]);
  const [consolidatedData, setConsolidatedData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [consolidateColumns, setConsolidateColumns] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [isReportVisible, setIsReportVisible] = useState(false);
  const [ConsolidatedSceneWiseReport, setConsolidatedSceneWiseReport] =
    useState([]);
  const [DetailedSceneWiseReport, setDetailedSceneWiseReport] = useState([]);
  const [reportType, setReportType] = useState("");
  const [shotDetails, setShotDetails] = useState([]);
  const [sceneDetails, setSceneDetails] = useState([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchProjects();

    const storedProject = localStorage.getItem("selectedProject");
    const storedOption = localStorage.getItem("option");
    const storedData = localStorage.getItem("data");
    const storedColumns = localStorage.getItem("columns");
    const storedConsolidatedData = localStorage.getItem("consolidatedData");
    const storedConsolidateColumns = localStorage.getItem("consolidateColumns");

    if (storedProject) setSelectedProject(storedProject);
    if (storedOption) setOption(storedOption);

    if (storedProject && storedOption) {
      if (storedData) setData(JSON.parse(storedData));
      if (storedColumns) setColumns(JSON.parse(storedColumns));
      if (storedConsolidatedData)
        setConsolidatedData(JSON.parse(storedConsolidatedData));
      if (storedConsolidateColumns)
        setConsolidateColumns(JSON.parse(storedConsolidateColumns));
    }
  }, []);

  useEffect(() => {
    const storedIsReportVisible = localStorage.getItem("isReportVisible");
    if (storedIsReportVisible) {
      setIsReportVisible(JSON.parse(storedIsReportVisible));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("isReportVisible", JSON.stringify(isReportVisible));
  }, [isReportVisible]);

  useEffect(() => {
    const storedIsReportVisible = localStorage.getItem("isReportVisible");
    const storedData = JSON.parse(localStorage.getItem("data") || "[]");

    if (storedIsReportVisible) {
      setIsReportVisible(JSON.parse(storedIsReportVisible));
    }

    if (storedData.length > 0) {
      setData(storedData);
      setIsReportVisible(true); // ✅ Ensure visibility is restored
    }
  }, []);

  useEffect(() => {
    const storedModalVisible = localStorage.getItem("modalVisible");
    if (storedModalVisible) {
      setModalVisible(JSON.parse(storedModalVisible));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("modalVisible", JSON.stringify(modalVisible));
  }, [modalVisible]);

  useEffect(() => {
    if (selectedProject) {
      localStorage.setItem("selectedProject", selectedProject);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (option) {
      localStorage.setItem("option", option);
    }
  }, [option]);

  useEffect(() => {
    const storedConsolidatedData = localStorage.getItem("consolidatedData");
    const storedConsolidateColumns = localStorage.getItem("consolidateColumns");

    if (storedConsolidatedData && storedConsolidateColumns) {
      setConsolidatedData(JSON.parse(storedConsolidatedData));
      setConsolidateColumns(JSON.parse(storedConsolidateColumns));
    }
  }, []);

  useEffect(() => {
    const storedConsolidatedData = JSON.parse(
      localStorage.getItem("consolidatedData") || "[]"
    );

    if (storedConsolidatedData.length > 0) {
      setConsolidatedData(storedConsolidatedData);
      setIsReportVisible(true);
    }
  }, []);

  useEffect(() => {
    if (data.length > 0) localStorage.setItem("data", JSON.stringify(data));
    if (columns.length > 0)
      localStorage.setItem("columns", JSON.stringify(columns));
    if (consolidatedData.length > 0)
      localStorage.setItem(
        "consolidatedData",
        JSON.stringify(consolidatedData)
      );
    if (consolidateColumns.length > 0)
      localStorage.setItem(
        "consolidateColumns",
        JSON.stringify(consolidateColumns)
      );
  }, [data, columns, consolidatedData, consolidateColumns]);

  useEffect(() => {
    const storedConsolidatedData = JSON.parse(
      localStorage.getItem("consolidatedData") || "[]"
    );
    const storedConsolidateColumns = JSON.parse(
      localStorage.getItem("consolidateColumns") || "[]"
    );

    if (
      storedConsolidatedData.length > 0 &&
      storedConsolidateColumns.length > 0
    ) {
      setConsolidatedData(storedConsolidatedData);

      // Reattach the `onCell` handlers for each column
      const updatedColumns = storedConsolidateColumns.map((col) => ({
        ...col,
        onCell: () => ({
          onDoubleClick: () => {
            if (option === "option2") {
              handleSceneDoubleClick(col.dataIndex);
            } else {
              handleShotDoubleClick(col.dataIndex);
            }
          },
        }),
      }));

      setConsolidateColumns(updatedColumns);
    }
  }, []);

  useEffect(() => {
    const storedReportType = localStorage.getItem("reportType");

    // ✅ Ensure correct handler is assigned based on report type
    if (storedReportType === "scene") {
      setConsolidateColumns((prevColumns) =>
        prevColumns.map((col) => ({
          ...col,
          onCell: () => ({
            onDoubleClick: () => handleSceneDoubleClick(col.dataIndex),
          }),
        }))
      );
    } else {
      setConsolidateColumns((prevColumns) =>
        prevColumns.map((col) => ({
          ...col,
          onCell: () => ({
            onDoubleClick: () => handleShotDoubleClick(col.dataIndex),
          }),
        }))
      );
    }
  }, [sceneDetails, reportType]);

  useEffect(() => {
    const storedShotDetails = JSON.parse(
      localStorage.getItem("shotDetails") || "[]"
    );
    if (storedShotDetails.length > 0) {
      console.log("Restoring shotDetails:", storedShotDetails);
      setShotDetails(storedShotDetails);
    } else {
      console.warn("❌ No shot details found in storage!");
    }
  }, []);

  useEffect(() => {
    const storedSceneDetails = JSON.parse(
      localStorage.getItem("sceneDetails") || "[]"
    );

    if (storedSceneDetails.length > 0) {
      console.log("✅ Restoring sceneDetails:", storedSceneDetails);
      setSceneDetails(storedSceneDetails);
    } else {
      console.warn("❌ No scene details found in storage!");
    }
  }, []);

  const clearData = () => {
    setData([]);
    setColumns([]);

    setConsolidatedData([]);
    setConsolidateColumns([]);
    setShotDetails([]);
    setSceneDetails([]);
    setReportType("");
    localStorage.removeItem("data");
    localStorage.removeItem("columns");
    localStorage.removeItem("consolidatedData");
    localStorage.removeItem("consolidateColumns");
    localStorage.removeItem("shotDetails");
    localStorage.removeItem("sceneDetails");
    localStorage.removeItem("reportType");
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`http://${ip_port}/projects_list/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      setProjectList(response.data);
    } catch (error) {
      console.error("Error fetching project list:", error);
    }
  };

  const handleProjectChange = (value) => {
    setSelectedProject(value);
    clearData();
  };

  const handleOptionChange = (value) => {
    setOption(value);
    clearData();

    localStorage.removeItem("tableState");
  };

  const handleGetData = async () => {
    console.log("selectedProject", selectedProject);

    if (!selectedProject) {
      message.warning("Please select a project.");
      // notification.warning({description:"Please select a project"})
      return;
    }

    setLoading(true);

    try {
      const url =
        option === "option1"
          ? `http://${ip_port}/get_shot_wise_reports/?proj=${selectedProject}`
          : `http://${ip_port}/scene_wise_v2/?project=${selectedProject}`;

      const response = await axios.get(url);
      const fetchedData = response.data;
      if (fetchedData.length === 0 || null) {
        alert("No data available for the selected project");
        return;
      }
      console.log("fetchedData", fetchedData);

      setTableParams({
        pagination: { pageSize: 10 },
        filters: {},
        sorter: {},
      });

      localStorage.removeItem("tableState");

      console.log("data", data);
      setData(fetchedData);

      if (option === "option1") {
        const columnOrder = ["scene", "shot", "mm"];
        const shotWiseColumns = Object.keys(fetchedData[0])
          .sort((a, b) => {
            const indexA = columnOrder.indexOf(a);
            const indexB = columnOrder.indexOf(b);
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            console.log("index", indexA - indexB);
            return indexA - indexB;
          })
          .map((key, index) => ({
            title: key,
            dataIndex: key,
            ellipsis: true,
            fixed: index < 4,
            key,

            width: 150,
            sorter: (a, b) => (a[key] > b[key] ? 1 : -1),
            filters: [...new Set(fetchedData.map((item) => item[key]))].map(
              (value) => ({ text: value, value })
            ),
            onFilter: (value, record) => record[key] === value,
          }));

        console.log("ShotWiseColumns", shotWiseColumns);
        setColumns(shotWiseColumns);
        setIsReportVisible(true);
      } else if (option === "option2") {
        const SceneWise = fetchedData["scene_wise_report"];
        const ConsolidatedSceneWise = fetchedData["consolidated_report"];
        const DetailedSceneWise = fetchedData["detailed_report"];

        setConsolidatedSceneWiseReport(ConsolidatedSceneWise);
        setDetailedSceneWiseReport(DetailedSceneWise);

        localStorage.setItem("sceneDetails", JSON.stringify(DetailedSceneWise));

        // ✅ Use DetailedSceneWiseReport as sceneDetails
        setSceneDetails(DetailedSceneWise);

        console.log("SceneWise", SceneWise);
        const SceneWiseColumns = Object.keys(SceneWise[0]).map(
          (key, index) => ({
            title: key,
            dataIndex: key,
            ellipsis: true,
            key,
            fixed: index < 4,
            sorter: (a, b) => (a[key] > b[key] ? 1 : -1),
            filters: [...new Set(SceneWise.map((item) => item[key]))].map(
              (value) => ({
                text: value,
                value,
              })
            ),
            onFilter: (value, record) => record[key] === value,
          })
        );
        console.log("SceneWiseColumns", SceneWiseColumns);
        setData(SceneWise);
        setColumns(SceneWiseColumns);
        setIsReportVisible(true);
      } else if (fetchedData.length > 0) {
        const dynamicColumns = Object.keys(fetchedData[0]).map((key) => ({
          title: key,
          dataIndex: key,
          ellipsis: true,
          key,
          sticky,
          sorter: (a, b) => (a[key] > b[key] ? 1 : -1),
          filters: [...new Set(fetchedData.map((item) => item[key]))].map(
            (value) => ({
              text: value,
              value,
            })
          ),

          onFilter: (value, record) => record[key] === value,
        }));
        console.log("dynamicColumns", dynamicColumns);
        setColumns(dynamicColumns);
        setIsReportVisible(true);
      } else {
        alert("No data found");
        setIsReportVisible(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);

      const errorMessage =
        error.response && error.response.data
          ? error.response.data.message ||
            error.response.data.error ||
            "Failed to fetch data"
          : "Failed to fetch data";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStoredTableState = () => {
    const storedState = localStorage.getItem("tableState");
    return storedState ? JSON.parse(storedState) : {};
  };

  const storedState = getStoredTableState();

  const [tableParams, setTableParams] = useState({
    pagination: storedState.pagination || { pageSize: 10 },
    filters: storedState.filters || {},
    sorter: storedState.sorter || {},
  });
  const enhancedProjectReportColumns = columns.map((col) => ({
    ...col,
    sorter: (a, b) => (a[col.dataIndex] > b[col.dataIndex] ? 1 : -1),
    sortOrder:
      tableParams.sorter?.columnKey === col.dataIndex
        ? tableParams.sorter.order
        : null,
    filters: [...new Set(data.map((item) => item[col.dataIndex]))].map(
      (value) => ({
        text: value,
        value,
      })
    ),
    filterSearch: true,
    filteredValue: tableParams.filters?.[col.dataIndex] || null,
    onFilter: (value, record) => record[col.dataIndex] === value,
  }));

  // Function to handle sorting and filtering changes
  const handleTableChange = (pagination, filters, sorter) => {
    const newState = {
      pagination,
      filters,
      sorter: sorter.columnKey ? sorter : {},
    };
    setTableParams(newState);
    localStorage.setItem("tableState", JSON.stringify(newState));
  };
  const filteredOptions = projectList.filter((option) =>
    option.toLowerCase().includes(searchText.toLowerCase())
  );
  const projectListMenu = (
    <div>
      <Input
        placeholder="Search project"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: "8px", width: "140px" }}
      />
      <Menu
        style={{ width: "140px", maxHeight: "200px", overflowY: "auto" }}
        // onClick={(e) => setSelectedProject(e.key)}
        onClick={(e) => handleProjectChange(e.key)}
      >
        {filteredOptions.map((project) => (
          <Menu.Item key={project}>{project}</Menu.Item>
        ))}
      </Menu>
    </div>
  );

  const optionListMenu = (
    <Menu
      style={{ maxHeight: "200px", overflowY: "auto" }}
      onClick={(e) => handleOptionChange(e.key)}
    >
      <Menu.Item key="option1">Shot_wise</Menu.Item>
      <Menu.Item key="option2">Scene_wise</Menu.Item>
    </Menu>
  );

  const handleShotDoubleClick = (statusKey) => {
    console.log("Raw Shot Details:", shotDetails);
    console.log("Filter Key:", statusKey);

    // const storedShotData = JSON.parse(localStorage.getItem("shotDetails") || "[]");
    const shotData =
      shotDetails.length > 0
        ? shotDetails
        : JSON.parse(localStorage.getItem("shotDetails") || "[]");

    if (!shotDetails || shotData.length === 0) {
      console.error("No shot data available to filter!");

      return;
    }

    const filteredShots = shotData.filter((shot) => shot.status === statusKey);
    console.log("filteredShots", filteredShots);

    console.log("Filtered Shots:", filteredShots);

    if (filteredShots.length === 0) {
      console.warn("No shots match the filter criteria.");
    }

    setModalData(filteredShots);
    localStorage.setItem(
      "modalDisplayData_shots",
      JSON.stringify(filteredShots)
    );
    localStorage.setItem("reportType", "shot");

    setReportType("shot");
    setModalVisible(true);
  };

  const handleSceneDoubleClick = (sceneStatusKey) => {
    console.log("Raw Scene Data:", sceneDetails);
    console.log("Filter Key:", sceneStatusKey);

    // const storedSceneData = JSON.parse(localStorage.getItem("DetailedSceneWiseReport") || "[]");
    const sceneData =
      sceneDetails.length > 0
        ? sceneDetails
        : JSON.parse(localStorage.getItem("sceneDetails") || "[]");

    const filteredScenes = sceneData.filter(
      (scene) => scene.status === sceneStatusKey
    );

    console.log("Filtered Scenes:", filteredScenes);

    if (filteredScenes.length === 0) {
      console.warn("No scenes match the filter criteria.");
    }

    setModalData(filteredScenes);

    localStorage.setItem(
      "modalDisplayData_scenes",
      JSON.stringify(filteredScenes)
    );

    setTimeout(() => {
      setModalData(filteredScenes);
      localStorage.setItem(
        "modalDisplayData_scenes",
        JSON.stringify(filteredScenes)
      );
      localStorage.setItem("reportType", "scene");

      setReportType("scene");
      setModalVisible(true);
    }, 0);
  };

  function generateConsolidatedReport(objects) {
    console.log("data as objects", objects);

    if (option == "option2") {
      console.log("ConsolidatedSceneWiseReport", ConsolidatedSceneWiseReport);

      // ✅ Store sceneDetails in localStorage BEFORE setting state
      localStorage.setItem(
        "sceneDetails",
        JSON.stringify(DetailedSceneWiseReport)
      );
      setSceneDetails(DetailedSceneWiseReport); // Ensure scene details are stored in state

      console.log("✅ Stored sceneDetails:", DetailedSceneWiseReport);

      const resultSceneColumns = Object.keys(ConsolidatedSceneWiseReport).map(
        (key) => ({
          title: key,
          dataIndex: key,
          key,
          ellipsis: true,
          onCell: (record) => ({
            onDoubleClick: () =>
              // handleSceneDoubleClick(key, DetailedSceneWiseReport),
              handleSceneDoubleClick(key),
          }),
        })
      );
      console.log("DetailedSceneWiseReport", DetailedSceneWiseReport);
      const sceneData = [ConsolidatedSceneWiseReport];

      setConsolidatedData(sceneData);
      setIsReportVisible(true);
      setConsolidateColumns(resultSceneColumns);

      localStorage.setItem("consolidatedData", JSON.stringify(sceneData));

      localStorage.setItem(
        "consolidateColumns",
        JSON.stringify(resultSceneColumns.map(({ onCell, ...rest }) => rest))
      );

      localStorage.setItem("isReportVisible", "true");
    } else {
      // Initialize the consolidated report
      const cons_report = {
        total_shots: objects.length,
        YTS: 0,
        WIP: 0,
        DONE: 0,
      };
      const newShotDetails = [];

      objects.forEach((obj) => {
        const statuses = [];
        const departments = { YTS: [], WIP: [], DONE: [] };

        for (const [key, value] of Object.entries(obj)) {
          if (key !== "shot" && key !== "scene" && value !== "NO WORK") {
            statuses.push(value);

            if (value === "YTS") {
              departments.YTS.push(key);
            } else if (value === "DONE") {
              departments.DONE.push(key);
            } else {
              departments.WIP.push(key);
            }
          }
        }

        const adjustedStatuses = statuses.map((status) =>
          status !== "YTS" && status !== "DONE" ? "WIP" : status
        );

        const statusCount = adjustedStatuses.reduce((acc, status) => {
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});

        let shotStatus = "";
        if (statusCount["YTS"] > (statusCount["WIP"] || 0)) {
          cons_report.YTS += 1;
          shotStatus = "YTS";
        } else if (statusCount["DONE"] === adjustedStatuses.length) {
          cons_report.DONE += 1;
          shotStatus = "DONE";
        } else if (statusCount["WIP"] >= (statusCount["YTS"] || 0)) {
          cons_report.WIP += 1;
          shotStatus = "WIP";
        }

        const departmentList = departments[shotStatus] || [];
        newShotDetails.push({
          shot: obj.shot,
          status: shotStatus,
          // department: departments[shotStatus].join(", ")
          department: departmentList.join(",  "),
        });
      });
      console.log("newshotDetails", newShotDetails);
      localStorage.setItem("shotDetails", JSON.stringify(newShotDetails));
      setShotDetails(newShotDetails);
      // const overall_data = { cons_report: cons_report, newShotDetails };

      console.log("updatedshotDetails", newShotDetails);

      const resultColumns = Object.keys(cons_report).map((key) => ({
        title: key,
        dataIndex: key,
        key,
        ellipsis: true,
        onCell: (record) => ({
          onDoubleClick: () => handleShotDoubleClick(key),
        }),
      }));

      const resultData = [
        {
          // ...result,
          ...cons_report,
        },
      ];

      setConsolidateColumns(resultColumns);
      setConsolidatedData(resultData);
      setIsReportVisible(true);
      console.log("resultData", resultData);
      localStorage.setItem("consolidatedData", JSON.stringify(resultData));
      localStorage.setItem(
        "consolidateColumns",
        JSON.stringify(resultColumns.map(({ onCell, ...rest }) => rest))
      );
      localStorage.setItem("isReportVisible", "true");
      console.log("resultcolumns", resultColumns);

      // return { cons_report: cons_report, newShotDetails };
    }
  }

  return (
    <div
      className="project_reports_container"
      style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}
    >
      <div className="display_horizontal">
        <div className="project_label">
          <label htmlFor="proj_dropdown" style={{ margin: "8px" }}>
            Project:
          </label>
          <Dropdown
            overlay={projectListMenu}
            trigger={["click"]}
            style={{ maxHeight: "200px", overflowY: "auto" }}
          >
            <div style={{ width: "80px" }}>
              <Button style={{ width: "140px" }} id="proj_dropdown">
                {selectedProject ? selectedProject : "Select a project"}
              </Button>
            </div>
          </Dropdown>
        </div>

        <div className="option_label">
          <label style={{ margin: "8px", marginLeft: "62px" }}>Options:</label>
          <Dropdown
            overlay={optionListMenu}
            trigger={["click"]}
            overlayStyle={{ maxHeight: "none", overflow: "visible" }}
          >
            <Button style={{ width: "auto", marginRight: "62px" }}>
              {option === "option1"
                ? "Shot_wise"
                : option === "option2"
                ? "Scene_wise"
                : "Select an option"}
            </Button>
          </Dropdown>
        </div>

        <Button
          type="primary"
          onClick={handleGetData}
          disabled={
            !selectedProject || !option
            // ||
            // (option === "option2" && !selectedScene)
          }
          style={{ width: "auto", padding: "10px", marginLeft: "99px" }}
        >
          Show Table
        </Button>

        {isReportVisible && data.length > 0 && (
          <Button
            type="primary"
            onClick={() => handleDownload(data, consolidatedData)}
            disabled={!selectedProject || !option}
            style={{ width: "100%", margin: "18px", padding: "10px" }}
          >
            Export Excel
          </Button>
        )}
        {isReportVisible && data.length > 0 && (
          // {isReportVisible && option === "option1" && data.length > 0 && (
          <Button
            type="primary"
            onClick={() => generateConsolidatedReport(data)}
            disabled={!selectedProject || !option}
            style={{ width: "100%", margin: "18px", padding: "10px" }}
          >
            Consolidated View
          </Button>
        )}
      </div>

      <div
        style={{
          marginTop: "20px",
          overflow: "auto",
          width: "80vw",
          height: "65vh",
        }}
      >
        {data.length > 0 && (
          <div>
            <Spin
              spinning={loading}
              tip="Loading data..."
              size="large"
              style={{ width: "100%" }}
            >
              <div className="scrollable-table-wrapper">
                <Table
                  className="custom-table"
                  dataSource={data}
                  columns={enhancedProjectReportColumns}
                  rowKey={(record) => record.id || record.shot}
                  // style={{ marginTop: "30px", width: "100%" }}
                  // pagination={tableParams.pagination}
                  pagination={false}
                  // scroll={{ x: "auto" }}

                  // scroll={{ x: "max-content" }}
                  scroll={{ x: "max-content", y: "calc(100vh - 450px)" }}
                  sticky
                  onChange={handleTableChange}
                  // filteredValue={tableParams.filters}
                  // sortOrder={tableParams.sorter?.order}
                  // sortedInfo={tableParams.sorter}
                />
              </div>
            </Spin>
          </div>
        )}
      </div>

      {consolidatedData.length > 0 && (
        <div>
          <Spin
            spinning={loading}
            tip="Loading data..."
            size="large"
            style={{ width: "90%", marginTop: "0px" }}
          >
            <Table
              className="custom-table"
              dataSource={consolidatedData}
              columns={consolidateColumns}
              //   rowKey={(record) => record.department}
              style={{
                marginTop: data.length > 0 ? "34px" : "5px",
                width: "550px",
              }}
              pagination={false}
              scroll={{ x: "max-content" }}
              //   rowClassName={(record) =>
              //     record.id === "grand-total" ? "grand-total-row" : ""
              //   }
            />
          </Spin>
        </div>
      )}

      <>
        <Modal
          title="Details"
          visible={modalVisible}
          // onCancel={() => setModalVisible(false)

          // }
          className={darkTheme ? "dark-theme" : "light-theme"}
          onCancel={() => {
            setModalVisible(false);

            setModalData([]); // Clear modal data
            localStorage.removeItem("modalDisplayData_shots");
            localStorage.removeItem("modalDisplayData_scenes");
          }}
          footer={[
            <Button
              key="export"
              type="primary"
              onClick={() => exportToExcel(modalData, reportType)}
            >
              Export Excel
            </Button>,
          ]}
          width={800}
        >
          <Spin spinning={modalLoading} tip="Loading details...">
            <Table
              className="custom-table"
              dataSource={modalData}
              scroll={{ x: "max-content", y: 400 }}
              tableLayout="auto"
              columns={
                modalData.length > 0
                  ? (() => {
                      if (reportType === "scene") {
                        const columnOrder = ["scene", "departments", "status"];
                        return columnOrder
                          .filter((key) => key in modalData[0])
                          .map((key) => ({
                            title: key.charAt(0).toUpperCase() + key.slice(1),
                            dataIndex: key,

                            key,
                            // ellipsis:true,
                            // width:600,
                            render: (text) => (
                              <div
                                style={{
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {Array.isArray(text) ? text.join(",  ") : text}
                              </div>
                            ),
                          }));
                      } else {
                        const order = ["shot", "department", "status"];
                        const remainingKeys = Object.keys(modalData[0]).filter(
                          (key) => !order.includes(key)
                        );

                        return [
                          ...order.map((key) => ({
                            title: key.charAt(0).toUpperCase() + key.slice(1),
                            dataIndex: key,
                            // ellipsis:true,
                            key,
                          })),
                          ...remainingKeys.map((key) => ({
                            title: key.charAt(0).toUpperCase() + key.slice(1),
                            dataIndex: key,
                            // ellipsis:true,
                            key,
                          })),
                        ];
                      }
                    })()
                  : []
              }
              pagination={false}
            />
          </Spin>
        </Modal>
      </>
    </div>
  );
};

export default GetProjectReports;
