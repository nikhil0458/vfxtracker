import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { fetchProjectList } from "./utils";
// import { sendFilePathToOpen } from "./Login";
import { sendFilePathToOpen } from "./WebSocketManager";
import { ip_port } from "./Configs";
import {
  Menu,
  Dropdown,
  Button,
  Table,
  Spin,
  Alert,
  message,
  Input,
  Modal,
  Radio,
  notification
} from "antd";

const ShotsReview = () => {
  const { accessToken, user } = useAuth();
  console.log("userControlsCheck", user.controls);
  const [shotReviewProjOptions, setShotReviewProjOptions] = useState([]);
  const [shotReviewData, setShotReviewData] = useState([]);
  const [shotReviewColumns, setShotReviewColumns] = useState([]);
  const [showTable, setShowTable] = useState(
    localStorage.getItem("shotReviewShowTable") === "true"
  );
  const [selectedShotReviewProject, setSelectedShotReviewProject] = useState(
    localStorage.getItem("shotsReviewSelectedProject") || null
  );
  const [selectedRow, setSelectedRow] = useState(() => {
    const saved = localStorage.getItem("selectedShotReviewRow");
    return saved ? JSON.parse(saved) : null;
  });
  const [statusUpdate, setStatusUpdate] = useState(
    () => localStorage.getItem("statusShotsReviewUpdate") || ""
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const { TextArea } = Input;
  const isFirstAutoLoad = useRef(true);


  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projects = await fetchProjectList(accessToken);
        console.log("projectsassetreview", projects);
        setShotReviewProjOptions(projects);
      } catch (error) {
        message.error("Failed to load project list");
        console.error(error);
      }
    };

    loadProjects();
  }, []);

  useEffect(() => {
    if (showTable && selectedShotReviewProject) {
      isFirstAutoLoad.current = true;
      handleShowTable(); 

    }
  }, [showTable, selectedShotReviewProject]);




  // useEffect(() => {
  //   if (!hasFetchedTable.current && showTable && selectedShotReviewProject) {
  //     hasFetchedTable.current = true;
  //        suppressInitialMessage.current = true;
  //     handleShowTable();
  //   }
  // }, [showTable, selectedShotReviewProject]);
  



  const resetToInitialStatesShots = () => {
    setSelectedShotReviewProject("select");
    localStorage.setItem("shotsReviewSelectedProject", "select");

    setShowTable(false);
    localStorage.setItem("shotReviewShowTable", "false");

    setSelectedRow(null);
    localStorage.removeItem("selectedShotReviewRow");

    setStatusUpdate("");
    localStorage.removeItem("statusUpdate");

    // setShowTable(false);
    // localStorage.setItem("biddingShowTable", false);
    // setData([]);
  };
  const handleShotProjReviewClick = async (e) => {
    if (e.key === "select") {
      message.warning("Select an option");
      resetToInitialStatesShots();
      return;
    }

    setSelectedShotReviewProject(e.key);
    localStorage.setItem("shotsReviewSelectedProject", e.key);

    setShowTable(false);
    localStorage.setItem("biddingShowTable", false);
    // setData([]);
    // setColumns([]);
  };

  const ShotReviewProjMenu = ({
    shotReviewProjOptions,
    handleShotProjReviewClick,
  }) => {
    const filteredOptions = shotReviewProjOptions.filter((option) =>
      option.toLowerCase().includes(searchText.toLowerCase())
    );
    return (
      <div style={{ maxHeight: "250px",width:"140px", overflowY: "auto", padding: "5px" }}>
        <Input
        placeholder="Search project"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: "8px" }}
      />
      <Menu
        onClick={handleShotProjReviewClick}
        style={{ overflowY: "auto", maxHeight: "200px" }}
      >
        <Menu.Item key="select">Select</Menu.Item>
        {filteredOptions.map((proj) => (
          <Menu.Item key={proj}>{proj}</Menu.Item>
        ))}
      </Menu>
      </div>
    );
  };

  const allowedKeys = ["proj", "shot", "task_name", "artist_name","status", "media_path"];

  const StatusMenu = ({ onSelect }) => (
    <Menu onClick={({ key }) => onSelect(key)}>
      <Menu.Item key="select">Select</Menu.Item>
      <Menu.Item key="DONE">DONE</Menu.Item>
      <Menu.Item key="RETAKE">RETAKE</Menu.Item>
    </Menu>
  );

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

  const handleTableChange = (pagination, filters, sorter) => {
    const newState = {
      pagination,
      filters,
      sorter: sorter.columnKey ? sorter : {},
    };
    setTableParams(newState);
    localStorage.setItem("tableState", JSON.stringify(newState));

    console.log("pagination", currentPage);
    setCurrentPage(pagination.current);
    console.log("pagination", currentPage);
  };

  const calculateColumnWidth = (key, data) => {
    const maxLength = Math.max(
      key.length,
      ...data.map((item) => (item[key] ? item[key].toString().length : 0))
    );
    return maxLength * 10 + 40; 
  };

  const handleShowTable = async () => {
    try {
      setShowTable(true);
      localStorage.setItem("shotReviewShowTable", "true");
      // const params = new URLSearchParams();
      // params.append("proj", selectedShotReviewProject);

      // Append each department separately
      // user.controls.forEach((dept) => {
      //   params.append("department", dept.toLowerCase());
      // });
   

      // console.log("paramsss", params.toString())
      const requestData = {
      proj: selectedShotReviewProject,
      department: user.controls.map((dept) => dept.toLowerCase()),
    };
    console.log("requestData", requestData);
      const response = await axios.post(
        `http://${ip_port}/review_tasks/`, requestData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );





      const rawData = response.data;
      console.log("responserawdata", rawData);
      if (!rawData || rawData.length === 0) {
        // message.info("No data available for this project.");
        if (!isFirstAutoLoad.current) {
        notification.error({description: "No data available for this project."})
        }
        isFirstAutoLoad.current = false;
        setShotReviewData([]);
        setShotReviewColumns([]);
        return;
      }

      const uniqueKeys = new Set();
      rawData.forEach((item) =>
        Object.keys(item).forEach((key) => uniqueKeys.add(key))
      );

      const formattedData = rawData.map((item, index) => ({
        key: index,
        ...item,
      }));

      const dynamicColumns = allowedKeys.map((key, index) => ({
        title: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
        dataIndex: key,
        key: key,
        width: calculateColumnWidth(key, formattedData),
        fixed: index < 3, // optionally fix first few columns
        filters: [
          ...Array.from(new Set(formattedData.map((item) => item[key]))).map(
            (value) => ({
              text: value?.toString(),
              value: value,
            })
          ),
        ],
        filterSearch:true,
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

      setShotReviewColumns(dynamicColumns);
      setShotReviewData(formattedData);
    } catch (error) {
      console.error("Error fetching asset review tasks:", error);
      message.error("Failed to fetch asset tasks.");
    }
  };

  const handleUpdateClick = async () => {
    if (!selectedRow) {
      message.warning("Please select a row.");
      return;
    }
    if (!statusUpdate) {
      message.warning("Please select a status.");
      return;
    }

    const now = new Date();
    const date = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const time = now.toTimeString().split(" ")[0]; // HH:MM:SS
    console.log("hours", selectedRow.hours, "spent", selectedRow.hours_spent);
    function timeToSeconds(timeStr) {
      const [hours, minutes, seconds] = timeStr.split(":").map(Number);
      return hours * 3600 + minutes * 60 + seconds;
    }
    const payload = {
      status: statusUpdate,
    };

    if ("DONE" === statusUpdate) {
      payload.done_by = `${user.emp_id}_${user.emp_name}_${date}_${time}`;
      const hours = timeToSeconds(selectedRow.hours);
      const hours_spent = timeToSeconds(selectedRow.hours_spent);
      if (hours_spent < hours) {
        payload.target = "MET";
      } else {
        payload.target = "NOT MET";
      }
    } else if ("READY TO REVIEW" === statusUpdate) {
      payload.done_by = `${user.emp_id}_${user.emp_name}_${date}_${time}`;
    }
    console.log("statussUpdate", statusUpdate);
    console.log("payload", payload);
    try {
      await axios.patch(
        `http://${ip_port}/assign_shot_task/${selectedRow._id}/`,

        payload,
        //  {

        //   status: statusUpdate_
        //   done_by:`${user.emp_id}-${user.emp_name}-${date}-${time}`
        // },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      message.success("Status updated successfully");

      // Clear selections
      localStorage.removeItem("selectedShotRow");
      localStorage.removeItem("statusUpdate");
      setSelectedRow(null);
      setStatusUpdate("");

      // Refresh table
      handleShowTable();
    } catch (error) {
      console.error("Failed to update status", error);
      message.error("Failed to update status.");
    }
  };

  return (
    <div className="shot_review_container">
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <div
          style={{
            display: "flex",

            flexWrap: "wrap",
            gap: "20px",
            marginRight: "auto",
          }}
        >
          <div style={{ marginLeft: "20px" }}>
            <label
              htmlFor="shot_review_proj_dropdown"
              style={{
                marginRight: "5px",
                textAlign: "center",
                borderRadius: "5px",
              }}
            >
              Project:
            </label>
            <Dropdown
              overlay={
                <ShotReviewProjMenu
                  shotReviewProjOptions={shotReviewProjOptions}
                  handleShotProjReviewClick={handleShotProjReviewClick}
                />
              }
              trigger={["click"]}
            >
              <Button style={{width:"130px"}}id="shot_review_proj_dropdown">
                {selectedShotReviewProject || "Select an option"}
              </Button>
            </Dropdown>
          </div>
          <Button
            type="primary"
            // onClick={handleShowTable}
            onClick={() => {
              isFirstAutoLoad.current = false; 
              handleShowTable();
            }}
            disabled={!selectedShotReviewProject}
          >
            Show Table
          </Button>
        </div>

        {showTable && (
          <div style={{ marginTop: "30px" }}>
            {/* 1. TextArea */}
            <TextArea
              rows={6}
              value={
                selectedRow
                  ? JSON.stringify(
                      Object.fromEntries(
                        Object.entries(selectedRow).filter(([key]) =>
                          allowedKeys.includes(key)
                        )
                      ),
                      null,
                      2
                    )
                  : "Select a row to see details."
              }
              //   value={selectedRow ? JSON.stringify(selectedRow, null, 2) : "Select a row to see details."}
              readOnly
              style={{ marginBottom: "20px" }}
            />

            {/* 2. Dropdown + 3. Update Button */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <Dropdown
                overlay={
                  <StatusMenu
                    onSelect={(key) => {
                      if (key === "select") {
                        message.warning(
                          "Please select a valid status (Done or Retake)."
                        );
                        return;
                      }
                      setStatusUpdate(key);
                      localStorage.setItem("statusUpdate", key);
                    }}
                  />
                }
                trigger={["click"]}
              >
                <Button>{statusUpdate || "Select Status"}</Button>
              </Dropdown>
              <Button type="primary" onClick={handleUpdateClick}>
                Update
              </Button>
              <Button
                type="primary"
                onClick={() => sendFilePathToOpen(selectedRow.media_path.replace(/^"(.*)"$/, '$1'))}
              >
                Open Media Path
              </Button>
            </div>

            {/* 4. Table */}
            <Table
              className="custom-table"
              columns={shotReviewColumns}
              dataSource={shotReviewData}
              rowKey={(record) => record.id || record._id || record.key}
              rowSelection={{
                type: "radio",
                onChange: (selectedRowKeys, selectedRows) => {
                  const selected = selectedRows[0];
                  setSelectedRow(selected);
                  localStorage.setItem(
                    "selectedShotReviewRow",
                    JSON.stringify(selected)
                  );
                },
                selectedRowKeys: selectedRow
                  ? [selectedRow.id || selectedRow._id || selectedRow.key]
                  : [],
              }}
              onChange={handleTableChange}
              sortOrder={tableParams.sorter?.order}
              sortedInfo={tableParams.sorter}
              pagination={tableParams.pagination}
              bordered
              scroll={{ x: "max-content", y: 400 }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ShotsReview;
