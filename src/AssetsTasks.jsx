import React, { useState, useEffect,useRef } from "react";
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
  InputNumber,
  Radio,
  Checkbox,
  Slider,
  notification,
} from "antd";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { ip_port } from "./Configs";
import { fetchProjectList } from "./utils";
import * as XLSX from "xlsx";

// import {fetchProjDepts} from "./utils";
import { AssetsTasksProjMenu } from "./assetDropdownMenuClicks";
// import { AssetsTasksDeptMenu } from "./assetDropdownMenuClicks";

import qs from "qs";

const AssetsTasks = () => {
  const { userControls, filteredData, accessToken, designation, user } =
    useAuth();

  const [taskAssetProjOptions, setTaskAssetProjOptions] = useState([]);
  const [selectedAssetProject, setSelectedAssetProject] = useState(
    localStorage.getItem("assetsSelectedProject") || null
  );
  const [taskData, setTaskData] = useState([]);
  const [taskColumns, setTaskColumns] = useState([]);

  const [showTaskAssetTable, setShowTaskAssetTable] = useState(false);

  const { TextArea } = Input;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState(null);
  const firstNotificationLoad = useRef(true);




  useEffect(() => {
    const getProjects = async () => {
      try {
        const projects = await fetchProjectList(accessToken);
        setTaskAssetProjOptions(projects);
      } catch (error) {
        console.error("Failed to fetch project list", error);
      }
    };

    getProjects();

    if (selectedAssetProject) {
      handleTaskAssetShowTableClick(user.emp_id);
    }

    const storedRow = localStorage.getItem("selectedAssetRow");
    if (storedRow) {
      setSelectedRow(JSON.parse(storedRow));
    }
  }, []);

  // useEffect(()=>{
  //   if(taskData.length>0){
  //     handleTaskAssetShowTableClick()
  //   }
  // },[taskData])

  const status_order = {
    YTS: ["WIP"],
    WIP: ["PAUSE", "READY TO REVIEW"],
    PAUSE: ["WIP", "READY TO REVIEW"],
    "READY TO REVIEW": [],
  };

  const handleTasksAssetProjClick = async (e) => {
    if (e.key === "select") {
      message.warning("Select an option");
      // notification.warning({description :"Select an option"})
      // resetToInitialStatesAssets();
      return;
    }

    setSelectedAssetProject(e.key);
    localStorage.setItem("assetsSelectedProject", e.key);
  };

  const showStatusModal = (record, currentStatus) => {
    const nextOptions = status_order[currentStatus] || [];

    if (nextOptions.length === 0) {
      message.info("No further transitions allowed from this status.");
      // notification.info({description:"No further transitions allowed from this status."})
      return;
    }

    let selectedStatus = nextOptions[0];
    let pathValue = "";

    let modal;

    const renderModalContent = () => (
      <div>
        <Radio.Group
          value={selectedStatus}
          onChange={(e) => {
            selectedStatus = e.target.value;
            pathValue = "";
            renderModal();
          }}
        >
          {nextOptions.map((opt) => (
            <Radio key={opt} value={opt}>
              {opt}
            </Radio>
          ))}
        </Radio.Group>

        {selectedStatus === "READY TO REVIEW" && (
          <div style={{ marginTop: 10 }}>
            <label>Enter Path:</label>
            <Input
              onChange={(e) => {
                pathValue = e.target.value;
              }}
              placeholder="Enter path for READY TO REVIEW"
            />
          </div>
        )}
      </div>
    );

    function normalizePath(pathStr) {
      return pathStr
        .trim() 
        .replace(/['"]/g, "") 
        .replace(/\\/g, "/"); 
    }

    const renderModal = () => {
      modal.update({
        content: renderModalContent(),
      });
    };

    modal = Modal.confirm({
      title: "Update Status",
      icon: null,
      closable: true,
      okText: "Update",
      cancelText: "Cancel",
      content: renderModalContent(),
      onOk: async () => {
        const payload = { status: selectedStatus };

        if (selectedStatus === "WIP") {
          if (!record?.artist_id) {
            message.error("Artist ID not found for this task.");
            
            
            
            // notification.error({description:"Artist ID not found for this task."});
            return Promise.reject();
          }

          let tasks = [];

          // const tasks = await handleWipTasks(true, record.artist_id);
          try {
            tasks = await handleWipTasks(true, record.artist_id); // this can throw!
          } catch (err) {
            console.error("🚫 handleWipTasks threw an error:", err);
            message.error("Failed to check WIP tasks.");
           
           
           
            // notification.error({description:"Failed to check WIP tasks."})
            return Promise.reject(new Error("WIP task exists"));
          }

          if (tasks && tasks.length > 0) {
            const task = tasks[0];
            Modal.warning({
              content: (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <p>
                    This artist already has a WIP task. Status update is
                    blocked.
                  </p>
                  <Input.TextArea
                    value={`Project: ${task.proj}\nAsset: ${task.asset_name}\nTask: ${task.task_name}`}
                    readOnly
                    style={{ resize: "none", marginBottom: "12px" }}
                  />
                </div>
              ),
              okText: "Close",
              // duration: 0,
            });
          
            return Promise.reject(
              new Error("Artist has an existing WIP task.")
            );
          }

        
          if (!record.a_start_date || record.a_start_date === "0000-00-00") {
            const today = new Date().toISOString().split("T")[0];
            payload.a_start_date = today;
          }
        }

        if (selectedStatus === "READY TO REVIEW") {
          if (!pathValue) {
            message.error("Path is required for READY TO REVIEW.");
         
         
            // notification.error({description: "Path is required for READY TO REVIEW"})
            return Promise.reject();
          }
          const normalizedPath = normalizePath(pathValue);
          payload.media_path = normalizedPath;
          const today = new Date().toISOString().split("T")[0];
          payload.a_end_date = today;
        }
        //  else if (selectedStatus === "WIP") {
        //   if (
        //     selectedStatus === "WIP" &&
        //     (!record.a_start_date || record.a_start_date === "0000-00-00")
        //   ) {
        //     const today = new Date().toISOString().split("T")[0]; // 'YYYY-MM-DD'
        //     payload.a_start_date = today;

        //   }
        // }

        try {
          await axios.patch(
            `http://${ip_port}/asset_tasks/${record._id}/`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (
            selectedStatus === "WIP" &&
            window.loginLogId &&
            record?.task_name
          ) {
            try {
              await axios.patch(
                `http://${ip_port}/login_log/${window.loginLogId}/`,
                { shot: record.task_name },
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                  },
                }
              );
              console.log(
                "✅ Login log updated with task_name:",
                record.task_name
              );
            } catch (err) {
              console.error(
                "❌ Failed to update login log with task_name:",
                err
              );
            }
          }

          message.success("Status updated.");
          // notification.success({description:"Status updated"});
          await handleTaskAssetShowTableClick(user.emp_id);
        } catch (err) {
          console.error("Status update failed", err);
          message.error("Update failed.");
          // notification.error({description:"Update failed"})
        }
      },
    });
  };
  const handleCellDoubleClick = (record, columnKey) => {
    const editableFieldsMap = {
      Artist: ["artist_comment", "status"],
      Supervisor: ["supervisor_comment", "description"],
      "Team Leader": ["team_leader_comment", "description", "status"],
      Manager: ["description"],
    };

    const editableFields = editableFieldsMap[designation] || [];

    if (!editableFields.includes(columnKey)) return;

    let inputValue = record[columnKey];
    let pathValue = "";

    if (
      (designation === "Artist" && columnKey === "status") ||
      (designation === "Team Leader" && columnKey === "status")
    ) {
      const nextOptions = status_order[inputValue] || [];

      if (nextOptions.length === 0) {
        message.info("No further transitions allowed from this status.");

        // notification.info({description: "No further transitions allowed from this status."})
        return;
      }

      let selectedStatus = nextOptions[0];

      showStatusModal(record, inputValue);
      return;
    }

    Modal.confirm({
      title: `Edit ${columnKey}`,
      content: (
        <Input
          defaultValue={inputValue}
          onChange={(e) => (inputValue = e.target.value)}
          style={{ width: "100%" }}
        />
      ),
      onOk: async () => {
        if (inputValue === undefined || inputValue === record[columnKey])
          return;

        try {
          await axios.patch(
            `http://${ip_port}/asset_tasks/${record._id}/`,
            { [columnKey]: inputValue },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          message.success("Update successful");
          // notification.success("Update successful");

        
          await handleTaskAssetShowTableClick(user.emp_id);
        } catch (err) {
          console.error("Update failed:", err);
          message.error("Update failed.");
          // notification.error("Update failed")
        }
      },
    });
  };

  const handleTaskAssetShowTableClick = async (empId) => {
    if (!selectedAssetProject || selectedAssetProject === "select") {
      message.warning("Please select a Project");
      // notification.warning("Please select a Project");
    }
    const isArtist = designation === "Artist";
    const endpoint = isArtist
      ? `asset_tasks/?proj=${selectedAssetProject}&artist_id=${empId}`
      : `asset_tasks/?proj=${selectedAssetProject}`;

    try {
      const response = await axios.get(`http://${ip_port}/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = response.data;
      console.log("responsedata", data);
      setTaskData(data);
      if(!data || data.length ===0){

        if (!firstNotificationLoad.current) {
            // notification.error({description: "Data not available for this project."});
            notification.error({description: "No data available for this project."});
           
        }
       
        firstNotificationLoad.current = false;

      
      }
      
         // Show notification only if user clicked "Show Table"
      // if ((!data || data.length === 0) && isNotification) {
      //  notification.error({ description: "No data available for this project." });
      // }
      const calculateColumnWidth = (key, data) => {
        const padding = 40;
        const maxLength = Math.max(
          ...data.map((item) => (item[key] ? item[key].toString().length : 0)),
          key.length
        );

        let calculatedWidth = maxLength * 10 + padding;


        return Math.min(Math.max(120, calculatedWidth), 800);
      };

      const allKeys =
        data.length > 0
          ? Object.keys(data[0]).filter((key) => key !== "_id")
          : [];

      const columns = allKeys.map((key, index) => ({
        title: key,
        dataIndex: key,
        key,
        width: calculateColumnWidth(key, taskData),
        ellipsis: true,
        fixed: index < 4 ? "left" : false,
        filters: [
          // ...Array.from(new Set(taskData.map((item) => item[key]))).map(
          ...Array.from(new Set(response.data.map((item) => item[key]))).map(
            (value) => ({
              text: value,
              value: value,
            })
          ),
        ],
        filteredValue: tableParams?.filters?.[key] || null,
        filterSearch: true,
        onFilter: (value, record) => {
          if (key === "status") {
            return record[key] === value;
          }
          return true;
        },
        sorter: (a, b) => {
          if (typeof a[key] === "number") {
            return a[key] - b[key];
          } else if (typeof a[key] === "string") {
            return a[key].localeCompare(b[key]);
          }
          return 0;
        },
        sortOrder:
          tableParams?.sorter?.columnKey === key
            ? tableParams.sorter.order
            : null,
        sortDirections: ["descend", "ascend"],
        onCell: (record) => ({
          onDoubleClick: () => handleCellDoubleClick(record, key),
        }),

        render: (text) => text,
      }));

      setTaskColumns(columns);
      setShowTaskAssetTable(true);
    } catch (err) {
      console.error("Error fetching table data:", err);
      message.error("Failed to load task data.");
      // notification.error({description: "Failed to load task data."});
    }
  };

  // const handleWipTasks= async ()=>{
  //   try{
  //   const response = await axios.get(`http://${ip_port}/asset_tasks/?status=wip`, {
  //     headers: {
  //       Authorization: `Bearer ${accessToken}`
  //     }
  //   });
  //   console.log("response",response)
  //   console.log('wip tasks :', response.data);

  // } catch (error) {
  //   console.error('wip tasks error:', error);
  // }
  // }

  const handleWipTasks = async (silent = false, artistId = user.emp_id) => {
    try {
      const response = await axios.get(
        `http://${ip_port}/asset_tasks/?status=wip&artist_id=${artistId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const tasks = response.data;
      if (!silent) {
        if (tasks.length === 0) {
          Modal.info({
            title: "WIP Tasks",
            content: "No WIP tasks found.",
          });
        } else {
          Modal.info({
            title: "WIP Tasks",
            width: 700,
            content: (
              <div
                style={{
                  maxHeight: "400px",
                  overflowY: "auto",
                  whiteSpace: "pre-wrap",
                }}
              >
                <pre>
                  {tasks
                    .map(
                      (task, index) =>
                        `${index + 1}. Project: ${task.proj}, Asset: ${
                          task.asset_name
                        }, Task: ${task.task_name}`
                    )
                    .join("\n")}
                </pre>
              </div>
            ),
            okText: "Close",
          });
        }
      }
      return tasks;
    } catch (error) {
      if (!silent) {
        console.error("WIP tasks error:", error);
        Modal.error({
          title: "Error Fetching WIP Tasks",
          content: error.message || "An unexpected error occurred.",
        });
      }
      console.error("WIP tasks error:", error);
      return [];
    }
  };

  const getStoredTableState = () => {
    const storedState = localStorage.getItem("tableState");
    return storedState ? JSON.parse(storedState) : {};
  };

  const storedState = getStoredTableState();
  // const [tableParams, setTableParams] = useState({
  //   pagination: storedState.pagination || { pageSize: 10 },
  //   filters: storedState.filters || {},
  //   sorter: storedState.sorter || {},
  // });

  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 100 },
    filters: {},
    sorter: {},
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

  const handleDeleteTasks = async () => {
    console.log("selectedRow", selectedRow);
    if (!selectedRow) {
      message.warning("Please select a row to delete.");
      // notification.warning({description:"Please select a row to delete."})
      return;
    }

    try {
      const response = await axios.delete(
        `http://${ip_port}/asset_tasks/${selectedRow._id}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log("response", response);
      console.log("response", response.data);
      message.success("Task deleted successfully.");
      // notification.success({description:"Task deleted successfully."})
      setSelectedRow(null);
      // localStorage.remove("assetTaskData", JSON.stringify(data));
      await handleTaskAssetShowTableClick(user.emp_id);
    } catch (error) {
      console.error("Delete task error:", error);
      message.error("Failed to delete task.");
      // notification.error({description:"Failed to delete task."})          

    }
  };

  const timeToMandays = (timeString) => {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    const mandays = totalSeconds / (7.5 * 3600); // 1 manday = 7.5 hours
    return Number(mandays.toFixed(2));
  };

  const mandaysToHours = (mandays) => {
    let total_seconds = mandays * 27000;
    let hours = Math.floor(total_seconds / 3600);
    let mins = Math.floor(total_seconds % 3600) / 60;
    let seconds = total_seconds % 60;
    return `${hours}:${mins}:${seconds}`;
  };

  const handleExcelExport = async () => {
    if (taskData.length > 0) {
      const filteredAssetTaskData = taskData.map(({ _id, ...rest }) => rest);
      const worksheet = XLSX.utils.json_to_sheet(filteredAssetTaskData);
      console.log("filteredAssetTaskdataonthepage", filteredAssetTaskData);

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      XLSX.writeFile(workbook, `Project_${selectedAssetProject}_Data.xlsx`);
    } else {
      console.log("No data available to export.");
    }
  };

  const handleEditMandays = async () => {
    if (!selectedRow) {
      message.warning("Please select a row to edit mandays.");
      // notification.warning({description: "Please select a row to edit mandays."});
      return;
    }

    const { asset_name, field, hours_spent, mandays } = selectedRow;

    if (!asset_name || !field || !hours_spent || mandays == null) {
      message.error(
        "Missing required fields (asset_name, field, hours_spent, mandays)."
      );
      // notification.error({description:"Missing required fields (asset_name,fields,hours_spent,mandays)."})
      return;
    }

    const convertedMandays = timeToMandays(hours_spent);

    try {
      const response = await axios.get(
        `http://${ip_port}/asset_tasks/edit_mandays/`,
        {
          params: {
            asset_name,
            field,
            hours_spent: convertedMandays,
            cur_mandays: mandays,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log("params:", asset_name, field, convertedMandays, mandays);
      const { scope } = response.data;
      console.log("scopee", response.data);
      if (!scope || scope.min == null || scope.max == null) {
        message.error("Invalid scope returned from API.");
        // notification.error("Invalid scope return from API.");
        return;
      }

      const minMandays = scope.min;
      const maxMandays = scope.max;

      let selectedMandays = mandays;

      Modal.confirm({
        title: "Edit Mandays",
        width: 600,
        icon: null,
        okText: "Submit",
        cancelText: "Cancel",
        content: (
          <div>
            <p>
              <strong>Min Mandays :</strong> {minMandays}
            </p>
            <p>
              <strong>Max Mandays :</strong> {maxMandays}
            </p>
            <p>
              <strong>Adjust Mandays:</strong>
            </p>
            <InputNumber
              min={minMandays}
              max={maxMandays}
              step={0.1}
              defaultValue={mandays}
              style={{ width: 120 }}
              onChange={(val) => {
                selectedMandays = val;
              }}
            />{" "}
            mandays
          </div>
        ),
        onOk: async () => {
          if (selectedMandays < minMandays || selectedMandays > maxMandays) {
            message.error(
              `Mandays must be between ${minMandays} and ${maxMandays}.`
            );
            // notification.error({description: `Mandays must be between ${minMandays} and ${maxMandays}`})
            return Promise.reject();
          }

          const hours = mandaysToHours(selectedMandays);

          try {
            const result = await axios.patch(
              `http://${ip_port}/asset_tasks/${selectedRow._id}/`,

              {
                mandays: selectedMandays,
                hours,
              },
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );

            message.success("Mandays updated successfully.");
            // notification.success({description: "Mandays updated successfully."})
            console.log("Final API Response:", result.data);
          } catch (error) {
            console.error("Mandays update failed:", error);
            message.error("Failed to submit updated mandays.");
            // notification.error({description:"Failed to submit updated mandays."})
          }
        },
      });
    } catch (error) {
      console.error("Mandays API Error:", error);
      Modal.error({
        title: "Mandays API Error",
        content: error.message || "An unexpected error occurred.",
      });
    }
  };

  return (
    <div className="tasks_tab_container">
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
              htmlFor="tasks_proj_dropdown"
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
                <AssetsTasksProjMenu
                  taskAssetProjOptions={taskAssetProjOptions}
                  handleTasksAssetProjClick={handleTasksAssetProjClick}
                />
              }
              trigger={["click"]}
            >
              <Button id="tasks_proj_dropdown" style={{ width: "140px" }}>
                {selectedAssetProject || "Select an option"}
              </Button>
            </Dropdown>
          </div>

          <div>
            <Button
              type="primary"
              onClick={() => handleTaskAssetShowTableClick(user.emp_id)}
              disabled={!selectedAssetProject}
            >
              Show Table
            </Button>
          </div>
          <div
            style={{
              display: "flex",

              flexWrap: "wrap",
              gap: "20px",
              marginLeft: "auto",
            }}
          >
            <>
              {designation === "Artist" && (
                <>
                  <Button onClick={handleWipTasks}>WIP Tasks</Button>
                  <Button onClick={handleExcelExport}>Excel Export</Button>
                </>
              )}

              {designation === "Team Leader" && (
                <>
                  <Button onClick={handleWipTasks}>WIP Tasks</Button>
                  <Button onClick={handleDeleteTasks}>Delete Task</Button>
                  <Button onClick={handleEditMandays}>Edit Mandays</Button>
                  <Button onClick={handleExcelExport}>Excel Export</Button>
                </>
              )}
              {(designation === "Supervisor" || designation === "Manager") && (
                <>
                  <Button onClick={handleDeleteTasks}>Delete Task</Button>
                  <Button onClick={handleEditMandays}>Edit Mandays</Button>
                  <Button onClick={handleExcelExport}>Excel Export</Button>
                </>
              )}
            </>
          </div>

          {selectedRow && (
            <div style={{ marginTop: "20px", width: "100%" }}>
              <label>Selected Row Data:</label>
              <TextArea
                rows={8}
                value={JSON.stringify(selectedRow, null, 2)}
                readOnly
                style={{ marginBottom: "20px", marginTop: "20px" }}
              />
            </div>
          )}

          {showTaskAssetTable && selectedAssetProject && (
            <Table
              className="custom-table"
              columns={taskColumns}
              dataSource={taskData}
              rowKey={(record) => record._id}
              onChange={handleTableChange}
              // sortOrder={tableParams.sorter?.order}
              // sortedInfo={tableParams.sorter}
              // pagination={tableParams.pagination}
              pagination={false}
              scroll={{ x: "max-content", y: 400 }}
              style={{ marginTop: "60px", border: "2px solid #ccc" }}
              // style={{ marginTop: "60px", minWidth: 1000,  border: "2px solid #ccc" }}
              bordered
              rowSelection={{
                type: "radio",
                onChange: (selectedRowKeys, selectedRows) => {
                  setSelectedRow(selectedRows[0]);
                  localStorage.setItem(
                    "selectedAssetRow",
                    JSON.stringify(selectedRows[0])
                  );
                },
              }}
              // filteredValue={tableParams.filters}
            />
          )}
        </div>
      </div>
    </div>
  );
};
export default AssetsTasks;

// Modal.info({
//   title: "Mandays API Response",
//   width: 700,
//   okText: "Close",
//   content: (
//     <div style={{ maxHeight: "400px", overflowY: "auto", whiteSpace: "pre-wrap" }}>
//       <div style={{ marginBottom: "12px", fontWeight: "bold" }}>
//         Converted Mandays from Time: {convertedMandays}
//         <br />
//         Mandays in Row: {mandays}
//       </div>
//       <pre>{JSON.stringify(response.data, null, 2)}</pre>
//     </div>
//   ),
// });

// Modal.confirm({
//   title: "Update Status",
//   content: ({ confirm }) => (
//     <>
//       <Radio.Group
//         onChange={(e) => {
//           selectedStatus = e.target.value;
//           if (selectedStatus !== "READY TO REVIEW") pathValue = "";
//         }}
//         defaultValue={selectedStatus}
//       >
//         {nextOptions.map((opt) => (
//           <Radio key={opt} value={opt}>
//             {opt}
//           </Radio>
//         ))}
//       </Radio.Group>
//       {selectedStatus === "READY TO REVIEW" && (
//         <div style={{ marginTop: 10 }}>
//           <label>Enter Path:</label>
//           <Input
//             onChange={(e) => {
//               pathValue = e.target.value;
//             }}
//             placeholder="Enter path for READY TO REVIEW"
//           />
//         </div>
//       )}
//     </>
//   ),
//   onOk: async () => {
//     const payload = { status: selectedStatus };
//     if (selectedStatus === "READY TO REVIEW") {
//       if (!pathValue) {
//         message.error("Path is required for READY TO REVIEW.");
//         return Promise.reject(); // prevent closing modal
//       }
//       payload.path = pathValue;
//     }

//     try {
//       await axios.patch(
//         `http://${ip_port}/asset_tasks/${record._id}/`,
//         payload,
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       message.success("Status updated.");
//       await handleTaskAssetShowTableClick(user.emp_id);
//     } catch (err) {
//       console.error("Status update failed", err);
//       message.error("Update failed.");
//     }
//   },
// });

// const modal = Modal.info({
//   title: "Update Status",
//   okText: "Update",
//   content: (
//     <div id="status-modal-content">
//       <Radio.Group
//         defaultValue={selectedStatus}
//         onChange={(e) => {
//           selectedStatus = e.target.value;
//           pathValue = "";
//           renderModal();
//         }}
//       >
//         {nextOptions.map((opt) => (
//           <Radio key={opt} value={opt}>
//             {opt}
//           </Radio>
//         ))}
//       </Radio.Group>

//       <div style={{ marginTop: 10 }}>
//         {selectedStatus === "READY TO REVIEW" && (
//           <>
//             <label>Enter Path:</label>
//             <Input
//               onChange={(e) => {
//                 pathValue = e.target.value;
//               }}
//               placeholder="Enter path for READY TO REVIEW"
//             />
//           </>
//         )}
//       </div>
//     </div>
//   ),
//   onOk: async () => {
//     const payload = { status: selectedStatus };
//     if (selectedStatus === "READY TO REVIEW") {
//       if (!pathValue) {
//         message.error("Path is required for READY TO REVIEW.");
//         return Promise.reject(); // prevent closing modal
//       }
//       payload.path = pathValue;
//     }
