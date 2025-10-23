import React, { useEffect, useState } from "react";
import { ip_port } from "./Configs";
import { ip_port } from "./Configs";
import "./ProjectReports.css";
import axios from "axios";
import { Dropdown, Menu, Button, message, Spin, Table, Modal } from "antd";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const GetProjectReports = () => {
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
    const storedModalData =
      localStorage.getItem("modalDisplayData_shots") ||
      localStorage.getItem("modalDisplayData_scenes");
    const storedReportType = localStorage.getItem("reportType");

    if (storedModalData) {
      setModalData(JSON.parse(storedModalData));
      setReportType(storedReportType);
      setModalVisible(true);
    }
  }, []);

  useEffect(() => {
    const storedModalData = localStorage.getItem("modalDisplayData_scenes");
    const storedReportType = localStorage.getItem("reportType");

    if (storedModalData && storedReportType === "scene") {
      setModalData(JSON.parse(storedModalData));
      setReportType("scene");
      setModalVisible(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("isReportVisible", JSON.stringify(isReportVisible));
  }, [isReportVisible]);

  useEffect(() => {
    const storedIsReportVisible = localStorage.getItem("isReportVisible");
    if (storedIsReportVisible) {
      setIsReportVisible(JSON.parse(storedIsReportVisible));
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
    const storedConsolidatedData = localStorage.getItem("consolidatedData");
    const storedConsolidateColumns = localStorage.getItem("consolidateColumns");
    const storedReportType = localStorage.getItem("reportType");

    if (storedConsolidatedData) {
      setConsolidatedData(JSON.parse(storedConsolidatedData));
    }

    if (storedConsolidateColumns) {
      const parsedColumns = JSON.parse(storedConsolidateColumns);
      const shotDetails = JSON.parse(
        localStorage.getItem("shotDetails") || "[]"
      );
      const sceneDetails = JSON.parse(
        localStorage.getItem("modalDisplayData_scenes") || "[]"
      );

      // Reattach `onCell` event handlers for both Shot-wise and Scene-wise reports
      const updatedColumns = parsedColumns.map((col) => ({
        ...col,
        onCell: (record) => ({
          onDoubleClick: () => {
            if (storedReportType === "shot") {
              handleShotDoubleClick(col.dataIndex, shotDetails);
            } else if (storedReportType === "scene") {
              handleSceneDoubleClick(col.dataIndex, sceneDetails);
            }
          },
        }),
      }));

      setConsolidateColumns(updatedColumns);
    }
  }, []);

  const clearData = () => {
    setData([]);
    setColumns([]);

    setConsolidatedData([]);
    setConsolidateColumns([]);
    localStorage.removeItem("data");
    localStorage.removeItem("columns");
    localStorage.removeItem("consolidatedData");
    localStorage.removeItem("consolidateColumns");
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(
        `http://${ip_port}/projects_list/`
      );
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
  };

  const handleGetData = async () => {
    console.log("selectedProject", selectedProject);

    if (!selectedProject) {
      message.warning("Please select a project.");
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
      console.log("fetchedData", fetchedData);
      console.log("data", data);
      setData(fetchedData);

      // if (fetchedData.length > 0) {
      if (option === "option2") {
        const SceneWise = fetchedData["scene_wise_report"];
        const ConsolidatedSceneWise = fetchedData["consolidated_report"];
        const DetailedSceneWise = fetchedData["detailed_report"];
        setConsolidatedSceneWiseReport(ConsolidatedSceneWise);
        setDetailedSceneWiseReport(DetailedSceneWise);

        console.log("SceneWise", SceneWise);
        const SceneWiseColumns = Object.keys(SceneWise[0]).map((key) => ({
          title: key,
          dataIndex: key,
          ellipsis: true,
          key,
        }));
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

  const projectListMenu = (
    <Menu
      style={{ maxHeight: "100px", overflowY: "auto" }}
      // onClick={(e) => setSelectedProject(e.key)}
      onClick={(e) => handleProjectChange(e.key)}
    >
      {projectList.map((project) => (
        <Menu.Item key={project}>{project}</Menu.Item>
      ))}
    </Menu>
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

  const handleDownload = async () => {
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

  const handleShotDoubleClick = (statusKey, shotDetails) => {
    console.log("Raw Shot Details:", shotDetails);
    console.log("Filter Key:", statusKey);

    if (!shotDetails || shotDetails.length === 0) {
      console.error("No shot data available to filter!");

      return;
    }

    const filteredShots = shotDetails.filter(
      (shot) => shot.status === statusKey
    );
    console.log("filteredShots", filteredShots);

    console.log("Filtered Shots:", filteredShots);

    if (filteredShots.length === 0) {
      console.warn("No shots match the filter criteria.");
    }

    localStorage.setItem(
      "modalDisplayData_shots",
      JSON.stringify(filteredShots)
    );
    localStorage.setItem("reportType", "shot");
    localStorage.setItem("selectedStatus", statusKey);

    setReportType("shot");
    setModalData(filteredShots);

    setTimeout(() => {
      console.log("Opening modal with:", filteredShots);
      setModalVisible(true);
    }, 0);
  };

  const handleSceneDoubleClick = (sceneStatusKey, DetailedSceneWiseReport) => {
    console.log("Raw Scene Data:", DetailedSceneWiseReport);
    console.log("Filter Key:", sceneStatusKey);

    // if (!DetailedSceneWiseReport || DetailedSceneWiseReport.length === 0) {
    //   console.error("No scene data available to filter!");
    //   return;
    // }

    const filteredScenes = DetailedSceneWiseReport.filter(
      (scene) => scene.status === sceneStatusKey
    );
    // const storedSceneDetails = JSON.parse(localStorage.getItem("DetailedSceneWiseReport") || "[]");
    // const sceneData = DetailedSceneWiseReport.length > 0 ? DetailedSceneWiseReport : storedSceneDetails;

    // if (!sceneData || sceneData.length === 0) {
    //   console.error("No scene data available to filter!");
    //   return;
    // }

    // const filteredScenes = sceneData.filter(
    //   (scene) => scene.status === sceneStatusKey
    // );

    console.log("Filtered Scenes:", filteredScenes);

    if (filteredScenes.length === 0) {
      console.warn("No scenes match the filter criteria.");
    }

    localStorage.setItem(
      "modalDisplayData_scenes",
      JSON.stringify(filteredScenes)
    );
    localStorage.setItem("reportType", "scene");

    setReportType("scene");
    setModalData(filteredScenes);
    // setModalVisible(true);

    setTimeout(() => {
      console.log("Opening modal with:", filteredScenes);
      setModalVisible(true);
    }, 0);
  };

  function generateConsolidatedReport(objects) {
    console.log("data as objects", objects);

    if (option == "option2") {
      console.log("ConsolidatedSceneWiseReport", ConsolidatedSceneWiseReport);

      const resultSceneColumns = Object.keys(ConsolidatedSceneWiseReport).map(
        (key) => ({
          title: key,
          dataIndex: key,
          key,
          ellipsis: true,
          onCell: (record) => ({
            onDoubleClick: () =>
              handleSceneDoubleClick(key, DetailedSceneWiseReport),
          }),
        })
      );
      console.log("DetailedSceneWiseReport", DetailedSceneWiseReport);
      const sceneData = [ConsolidatedSceneWiseReport];

      setConsolidatedData(sceneData);
      setConsolidateColumns(resultSceneColumns);

      localStorage.setItem("consolidatedData", JSON.stringify(sceneData));

      localStorage.setItem(
        "DetailedSceneWiseReport",
        JSON.stringify(DetailedSceneWiseReport)
      ); // ✅ Store detailed data

      localStorage.setItem(
        "consolidateColumns",
        JSON.stringify(resultSceneColumns.map(({ onCell, ...rest }) => rest))
      );
      // localStorage.set
    } else {
      // Initialize the consolidated report
      const cons_report = {
        total_shots: objects.length,
        YTS: 0,
        WIP: 0,
        DONE: 0,
      };
      const shotDetails = [];

      // Iterate through each object
      objects.forEach((obj) => {
        const statuses = [];
        const departments = { YTS: [], WIP: [], DONE: [] };

        for (const [key, value] of Object.entries(obj)) {
          if (key !== "shot" && value !== "NO WORK") {
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
        shotDetails.push({
          shot: obj.shot,
          status: shotStatus,
          // department: departments[shotStatus].join(", ")
          department: departmentList.join(", "),
        });
      });

      const overall_data = { cons_report: cons_report, shotDetails };
      localStorage.setItem("shotDetails", JSON.stringify(shotDetails));
      console.log("shotDetails", shotDetails);

      const resultColumns = Object.keys(overall_data.cons_report).map(
        (key) => ({
          title: key,
          dataIndex: key,
          key,
          ellipsis: true,
          onCell: (record) => ({
            onDoubleClick: () => handleShotDoubleClick(key, shotDetails),
          }),
        })
      );

      const resultData = [
        {
          // ...result,
          ...cons_report,
        },
      ];

      setConsolidateColumns(resultColumns);
      setConsolidatedData(resultData);
      console.log("resultData", resultData);
      localStorage.setItem("consolidatedData", JSON.stringify(resultData));
      localStorage.setItem(
        "consolidateColumns",
        JSON.stringify(resultColumns.map(({ onCell, ...rest }) => rest))
      );
      console.log("resultcolumns", resultColumns);

      return { cons_report: cons_report, shotDetails };
    }
  }

  return (
    <div
      className="project_reports_container"
      style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}
    >
      <div className="display_horizontal">
        <div className="project_label">
          <label style={{ margin: "8px" }}>Project:</label>
          <Dropdown
            overlay={projectListMenu}
            trigger={["hover"]}
            style={{ maxHeight: "200px", overflowY: "auto" }}
          >
            <Button style={{ width: "auto" }}>
              {selectedProject ? selectedProject : "Select a project"}
            </Button>
          </Dropdown>
        </div>

        <div className="option_label">
          <label style={{ margin: "8px", marginLeft: "22px" }}>Options:</label>
          <Dropdown overlay={optionListMenu} trigger={["hover"]}>
            <Button style={{ width: "auto" }}>
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
          style={{ width: "auto", padding: "10px", marginLeft: "69px" }}
        >
          Get Data
        </Button>

        {isReportVisible && data.length > 0 && (
          <Button
            type="primary"
            onClick={handleDownload}
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
              <Table
                className="custom-table"
                dataSource={data}
                columns={columns}
                rowKey={(record) => record.id || record.shot}
                style={{ marginTop: "30px" }}
                pagination={false}
                scroll={{ x: "max-content" }}
                sticky
              />
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
              style={{ marginTop: data.length > 0 ? "34px" : "5px" }}
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
          onCancel={() => setModalVisible(false)}
          // onCancel={() => {
          //   setModalVisible(false);
          //   setModalData([]); // Clear modal data
          //   localStorage.removeItem("modalDisplayData"); // Remove stored modal data
          // }}

          footer={null}
          width={800}
        >
          <Spin spinning={modalLoading} tip="Loading details...">
            <Table
              className="custom-table"
              dataSource={modalData}
              scroll={{ x: "max-content", y: 400, width: "150px" }}
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
                            render: (text) =>
                              Array.isArray(text) ? text.join(", ") : text,
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
                            key,
                          })),
                          ...remainingKeys.map((key) => ({
                            title: key.charAt(0).toUpperCase() + key.slice(1),
                            dataIndex: key,
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










// const handleTaskShowTableClick = async () => {
//   try {
//     let params = {};

//     if (designation === "Artist") {
//       params = {
//         proj: selectedTaskProject,
//         department: selectedTaskDept,
//         role: "artist_specific_value", 
//       };
//     } else if (designation === "Manager") {
//       params = {
//         proj: selectedTaskProject,
//         managerView: true,
//         department: selectedTaskDept,
       
//       };
//     } else if (designation === "Teamlead") {
//       params = {
//         proj: selectedTaskProject,
//         teamleadView: true,
//         department: selectedTaskDept,
        
//       };
//     } else {
//       params = {
//         proj: selectedTaskProject,
//         department: selectedTaskDept,
//       };
//     }

//     await handleTaskShowTable(params);

//   } catch (error) {
//     console.error("Error handling Show Table click:", error);
//   }
// };
