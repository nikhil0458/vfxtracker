import React, { useEffect, useState } from "react";
import { ip_port } from "./Configs";
import { ip_port } from "./Configs";
import "./ProjectReports.css";
import axios from "axios";
import { Dropdown, Menu, Button, message, Spin, Table, Modal } from "antd";
import "./App.css";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";











const ProjectReports = () => {
  const [projectList, setProjectList] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [sceneList, setSceneList] = useState([]);
  const [selectedScene, setSelectedScene] = useState("");
  const [option, setOption] = useState("");
  const [data, setData] = useState([]);
  const [consolidatedData, setConsolidatedData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [consolidateColumns, setConsolidateColumns] = useState([]);
  const [loading, setLoading] = useState(false);

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupData, setPopupData] = useState([]);
  const [isReportVisible, setIsReportVisible] = useState(false);
  const [selectedRowKey, setSelectedRowKey] = useState(null);

 
  const [filterOfFilterProjectReportData, isFilterOfFilterProjectReportData] = useState([]);
 


  useEffect(() => {
    fetchProjects();
    const storedProject = localStorage.getItem("selectedProject");
    const storedOption = localStorage.getItem("option");

    if (storedProject) setSelectedProject(storedProject);
    if (storedOption) setOption(storedOption);
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedProject", selectedProject);
    localStorage.setItem("option", option);

    if (selectedProject) {
      setOption("");
      setSelectedScene("");
    }
  }, [selectedProject]);

  useEffect(() => {
    localStorage.setItem("selectedProject", selectedProject);
    setData([]);
    setConsolidatedData([]);
    setColumns([]);
    setConsolidateColumns([]);

    setSelectedScene("");
  }, [selectedProject]);

  useEffect(() => {
    localStorage.setItem("selectedProject", selectedProject);
    localStorage.setItem("option", option);
  }, [selectedProject, option]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`http://${ip_port}/projects_list/`);
      setProjectList(response.data);
    } catch (error) {
      console.error("Error fetching project list:", error);
    }
  };

  const fetchScenes = async () => {
    try {
      const response = await axios.get(
        `http://${ip_port}/get_scenes_from_project/?proj=${selectedProject}`
      );
      console.log("scene_list_response", response);
      setSceneList(response.data);
    } catch (error) {
      console.error("Error fetching scene list:", error);
      message.error("Failed to fetch scene list");
    }
  };

  const handleOptionChange = (option) => {
    setOption(option);
    setData([]);
    setConsolidatedData([]);
    setColumns([]); //
    setConsolidateColumns([]);
    setIsReportVisible(false);
    if (option === "option2") {
      fetchScenes();
    }
    setSelectedScene("");
  };

  const handleGetData = async () => {
    console.log("selectedProject", selectedProject);
    console.log("selectedScene", selectedScene);

    if (!selectedProject) {
      message.warning("Please select a project.");
      return;
    }
    setLoading(true);

    try {
      const url =
        option === "option1"
          ? `http://${ip_port}/get_shot_wise_reports/?proj=${selectedProject}`
          : `http://${ip_port}/get_scene_wise_reports/?proj=${selectedProject}&scene=${selectedScene}`;

      const response = await axios.get(url);
      const fetchedData = response.data;
      console.log("fetchedData", fetchedData);
      setData(fetchedData);

      // if (fetchedData.length > 0) {
      if (option === "option2") {
        const SceneWiseColumns = Object.keys(fetchedData[0]).map((key) => ({
          title: key,
          dataIndex: key,
          ellipsis: true,
          key,
          onCell: (record) => ({
            onDoubleClick: () =>
              handleDoubleClick(
                key,
                record.scene || record.department,
                selectedProject
              ),
          }),
        }));
        setColumns(SceneWiseColumns);
        setIsReportVisible(true);
      } else if (fetchedData.length > 0) {
        const dynamicColumns = Object.keys(fetchedData[0]).map((key) => ({
          title: key,
          dataIndex: key,
          ellipsis: true,
          key,
        }));
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
      onClick={(e) => setSelectedProject(e.key)}
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

  const sceneListMenu = (
    <Menu
      style={{ maxHeight: "100px", overflowY: "auto" }}
      onClick={(e) => setSelectedScene(e.key)}
    >
      <Menu.Item key="All">All</Menu.Item>
      {sceneList.map((scene) => (
        <Menu.Item key={scene}>{scene}</Menu.Item>
      ))}
    </Menu>
  );
  const handleDownload = async () => {
    const workbook = new ExcelJS.Workbook();

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

    // Sheet 2: Consolidated Data
    if (consolidatedData.length > 0) {
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
    saveAs(blob, "ProjectReports.xlsx");
  };

  const handleConsolidatedView = async () => {
    const response = await axios.get(
      `http://${ip_port}/get_scene_wise_reports/?proj=${selectedProject}&scene=All`
    );
    const result = response.data;
    const updatedResult = result.map((row) => {
      const total = Object.values(row)
        .filter((value) => typeof value === "number")
        .reduce((sum, num) => sum + num, 0);
      return { ...row, TOTAL: total };
    });
    console.log("updatedResult", updatedResult);

    const grandTotal = Object.keys(updatedResult[0]).reduce(
      (acc, key, index) => {
        if (typeof updatedResult[0][key] === "number") {
          acc[key] = updatedResult.reduce(
            (sum, row) => sum + (row[key] || 0),
            0
          );
        } else {
          acc[key] = index === 0 ? "Grand Total" : null;
        }
        return acc;
      },
      {}
    );

    console.log("Grand Total Row", grandTotal);

    grandTotal.id = "grand-total";

    const finalResult = [...updatedResult, grandTotal];
    setConsolidatedData(finalResult);
    console.log("consolidatedData", finalResult);

    if (finalResult.length > 0) {
      const resultColumns = Object.keys(finalResult[0])
        .filter((key) => key !== "id")
        .map((key) => ({
          title: key,
          dataIndex: key,
          ellipsis: true,
          key,
          onCell: (record) => ({
            onDoubleClick: () =>
              handleDoubleClick(record.department, key, selectedProject),
          }),
        }));
      setConsolidateColumns(resultColumns);
      console.log("resultColumns", resultColumns);
    }

    console.log("consolidatedresponse", response);
  };

  const handleDoubleClick = async (columnName, rowName, selectedProject) => {
    console.log(
      "Column:",
      columnName,
      "Row:",
      rowName,
      "Selected Project:",
      selectedProject
    );
    try {
      setLoading(true);
      const response = await axios.get(
        `http://${ip_port}/consolidated_filter/`,
        {
          params: {
            proj: selectedProject,
            dept: rowName,
            status: columnName,
          },
        }
      );
      const result = response.data;
      console.log("response", result);

      const mappedData = result.map((item) => ({
        scene: item.scene,
        shot: item.shot,
        artistName: item.artist_name,
        hours: item.hours,
        hoursSpent: item.hours_spent,
      }));

      setPopupData(mappedData);
      setPopupVisible(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const enhancedColumns = consolidateColumns.map((column) => ({
    ...column,
    onCell: (record) => ({
      onDoubleClick: () =>
        handleDoubleClick(column.key, record.department, selectedProject),
    }),
  }));

  const popupColumns = [
    { title: "Scene", dataIndex: "scene", key: "scene" },
    { title: "Shot", dataIndex: "shot", key: "shot" },
    { title: "Artist Name", dataIndex: "artistName", key: "artistName" },
    { title: "Hours", dataIndex: "hours", key: "hours" },
    { title: "Hours Spent", dataIndex: "hoursSpent", key: "hoursSpent" },
  ];

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
            trigger={["click"]}
            style={{ maxHeight: "200px", overflowY: "auto" }}
          >
            <Button style={{ width: "150px" }}>
              {selectedProject ? selectedProject : "Select a project"}
            </Button>
          </Dropdown>
        </div>

        <div className="option_label">
          <label style={{ margin: "8px" }}>Options:</label>
          <Dropdown overlay={optionListMenu} trigger={["click"]}>
            <Button style={{ width: "auto" }}>
              {option === "option1"
                ? "Shot_wise"
                : option === "option2"
                ? "Scene_wise"
                : "Select an option"}
            </Button>
          </Dropdown>
        </div>

        {option === "option2" && (
          <div className="scene_label">
            <label style={{ margin: "8px" }}>Scene:</label>
            <Dropdown overlay={sceneListMenu} trigger={["click"]}>
              <Button style={{ width: "auto" }}>
                {selectedScene ? selectedScene : "Select a scene"}
              </Button>
            </Dropdown>
          </div>
        )}

        <Button
          type="primary"
          onClick={handleGetData}
          disabled={
            !selectedProject ||
            !option ||
            (option === "option2" && !selectedScene)
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
        {isReportVisible && option === "option1" && data.length > 0 && (
          <Button
            type="primary"
            onClick={handleConsolidatedView}
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
                // bordered
                // components={{
                //   header: { cell: ResizableTitle },
                // }}
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
              columns={enhancedColumns}
              rowKey={(record) => record.department}
              style={{ marginTop: data.length > 0 ? "34px" : "5px" }}
              pagination={false}
              scroll={{ x: "max-content" }}
              rowClassName={(record) =>
                record.id === "grand-total" ? "grand-total-row" : ""
              }
            />
          </Spin>
        </div>
      )}

      <>
        <Modal
          title="Details"
          visible={popupVisible}
          onCancel={() => setPopupVisible(false)}
          footer={null}
          width={900}
        >
          {popupData.length > 0 ? (
            <Table
              className="custom-table"
              dataSource={popupData}
              columns={popupColumns}
              rowKey={(record, index) => index}
              pagination={false}
              scroll={{ x: "max-content", y: 400 }}
              sticky
            />
          ) : (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <p>No data available to display.</p>
            </div>
          )}
        </Modal>
      </>
    </div>
  );
};

export default ProjectReports;
