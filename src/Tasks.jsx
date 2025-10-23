import React, { useState, useEffect, useRef } from "react";
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
  Checkbox,
  notification,
} from "antd";
import axios from "axios";
import { useAuth } from "./AuthContext";
import "./Shots.css";
import { ip_port } from "./Configs";
// import { ip_port } from "./Configs";
import { ShotsTasksProjMenu } from "./shotsDropdownMenuClicks";
import { ShotsTasksDeptMenu } from "./shotsDropdownMenuClicks";
// import { loadShotsData, getShotsData } from "./utils";
import * as XLSX from "xlsx";
import qs from "qs";

// import "./Tasks.css"

//  const SHOTTASKSHEADERS=[
//   "_id", "proj","scene", "shot", "reel", "priority",  "type", "frames",
//   "duration", "thumbnail", "exr", "sow", "cgi_character", "cgi_creature",
//   "cgi_asset", "task_name", "artist_id", "artist_name", "department", "field",
//   "mandays", "hours", "assigned_by", "a_start_date", "a_end_date", "status",
//   "media_path", "hours_spent", "description", "review", "artist_comment",
//   "supervisor_comment", "team_leader_comment", "created_at", "a_i_status", "target"
// ]

const SHOTTASKSHEADERS = [
  "_id",
  "proj",
  "scene",
  "shot",
  "artist_name",
  "artist_id",
  "task_name",
  "department",
  "frames",
  "duration",
  "thumbnail",
  "exr",
  "sow",
  "field",
  "mandays",
  "hours",
  "hours_spent",
  "status",
  "a_start_date",
  "a_end_date",
  "media_path",
  "description",
  "review",
  "artist_comment",
  "supervisor_comment",
  "team_leader_comment",
  "assigned_by",
  "created_at",
  "a_i_status",
  "target",
];

const Tasks = () => {
  const { userControls, filteredData, accessToken, designation, user } =
    useAuth();

  const { confirm } = Modal;

  const loadShotsData = async () => {
    try {
      const response = await axios.get(
        "http://192.168.80.193:8888/users_data/"
      );
      const data = response.data;

      localStorage.setItem("shotsData", JSON.stringify(data));
      console.log("shotsData loaded and saved to localStorage:", data);
      return data;
    } catch (error) {
      console.error("Failed to load shots data:", error);
      const cached = localStorage.getItem("shotsData");
      return cached ? JSON.parse(cached) : null;
    }
  };

  const getShotsData = () => {
    return JSON.parse(localStorage.getItem("shotsData")) || null;
  };
  const [taskProjOptions, setTaskProjOptions] = useState([]);
  const [selectedTaskProject, setSelectedTaskProject] = useState(
    localStorage.getItem("tasksSelectedProject") || null
  );

  const [selectedTaskDept, setSelectedTaskDept] = useState(
    localStorage.getItem("tasksSelectedDept") || null
  );

  const [taskDeptOptions, setTaskDeptOptions] = useState([]);

  const [AuthorizedHeaders, setAuthorizedHeaders] = useState([]);
  const [authorizedTaskDepartments, setTaskAuthorizedDepartments] = useState(
    []
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [showTaskTable, setTaskShowTable] = useState(
    JSON.parse(localStorage.getItem("tasksShowTable")) || false
  );
  const [selectedRowData, setSelectedRowData] = useState(
    JSON.parse(localStorage.getItem("selectedShotTaskRowData")) || null
  );

  const [taskColumns, setTaskColumns] = useState([]);
  const [taskData, setTaskData] = useState([]);
  const [timeInSeconds, setTimeInSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  // const [wipTaskNameModal, setWipTaskNameModal] = useState(false)
  const [formatedTime, setFormatedTime] = useState("00:00:00");

  const status_order = {
    YTS: ["WIP"],
    WIP: ["PAUSE", "READY TO REVIEW"],
    PAUSE: ["WIP", "READY TO REVIEW"],
    "READY TO REVIEW": [],
  };

  const [editingRow, setEditingRow] = useState(null);
  const [statusOptions, setStatusOptions] = useState([]);

  const [selectedStatus, setSelectedStatus] = useState(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [artistComment, setArtistComment] = useState("");
  const [mediaPath, setMediaPath] = useState("");
  const [isDescriptionModalVisible, setIsDescriptionModalVisible] =
    useState(false);

  const [modalValue, setModalValue] = useState("");
  const [aiStatus, setAiStatus] = useState(null);
  const { TextArea } = Input;

  const [isReassignModalVisible, setIsReassignModalVisible] = useState(false);
  const [newArtistId, setNewArtistId] = useState(null);
  const [selectedEmpName, setSelectedEmpName] = useState("");
  // const [artistOptions, setArtistOptions] = useState([]);

  const [globalShotsObject, setGlobalShotsObject] = useState(getShotsData());

  const [loadingRowSelection, setLoadingRowSelection] = useState(false);

  const [isStatusBlocked, setIsStatusBlocked] = useState(false);

  const prevProjectRef = useRef(null);
  const taskNotificationLoad = useRef(true);

  useEffect(() => {
    console.log("before getting users");
    const fetchShots = async () => {
      const data = await loadShotsData();
      setGlobalShotsObject(data);
    };
    fetchShots();
    console.log("after getting users");
  }, []);

  useEffect(() => {
    if (
      prevProjectRef.current &&
      prevProjectRef.current !== selectedTaskProject
    ) {
      // Project changed — clear the selected row
      setSelectedRowData(null);
      localStorage.removeItem("selectedShotTaskRowData");
      console.log("🧹 Cleared selected row due to project change");
    }

    // Update the previous project reference
    prevProjectRef.current = selectedTaskProject;
  }, [selectedTaskProject]);

  useEffect(() => {
    const loadInitialData = async () => {
      const savedProject = localStorage.getItem("tasksSelectedProject");
      const savedDeptOption = localStorage.getItem("tasksSelectedDept");

      const savedAuthorizedHeaders =
        JSON.parse(localStorage.getItem("shotAuthorizedHeaders")) || [];

      if (savedProject) {
        setSelectedTaskProject(savedProject);
        const projDepts = await fetchProjDepts(savedProject);
        console.log("projDepts", projDepts);
        setTaskAuthorizedDepartments(projDepts);
      }

      if (savedAuthorizedHeaders.length > 0) {
        setAuthorizedHeaders(savedAuthorizedHeaders);
        setSelectedTaskDept(savedAuthorizedHeaders);
      }

      if (savedDeptOption && savedDeptOption !== "select") {
        setSelectedTaskDept(savedDeptOption);
      } else {
        setSelectedTaskDept(null);
      }

      if (savedProject && savedDeptOption && savedDeptOption !== "select") {
        await handleTaskShowTableClick(user.emp_id);
      }
    };

    loadInitialData();
    fetchProjOptions();
    fetchDeptOptions();
  }, []);

  useEffect(() => {
    let timer;

    if (isTimerRunning) {
      timer = setInterval(() => {
        setTimeInSeconds((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isTimerRunning]);

  useEffect(() => {
    const hours = String(Math.floor(timeInSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((timeInSeconds % 3600) / 60)).padStart(
      2,
      "0"
    );
    const seconds = String(timeInSeconds % 60).padStart(2, "0");

    setFormatedTime(`${hours}:${minutes}:${seconds}`);

    // if (timeInSeconds > 0) {
    if (seconds == "00") {
      updateTimeInDatabase(`${hours}:${minutes}:${seconds}`);
    }
  }, [timeInSeconds]);

  useEffect(() => {
    console.log("usercontrols1", userControls, typeof userControls);
    const AuthTaskHeaders = userControls.filter(
      (x) => authorizedTaskDepartments.includes(x)
      //  Array.isArray(authorizedTaskDepartments) && authorizedTaskDepartments.includes(x)
    );

    setAuthorizedHeaders(AuthTaskHeaders);
    localStorage.setItem(
      "biddingTaskAuthorizedHeaders",
      JSON.stringify(AuthTaskHeaders)
    );
    setTaskDeptOptions(AuthTaskHeaders);
  }, [authorizedTaskDepartments]);

  useEffect(() => {
    const savedProject = localStorage.getItem("tasksSelectedProject");
    const savedDept = localStorage.getItem("tasksSelectedDept");

    if (savedProject && savedDept && savedDept !== "select") {
      setSelectedTaskProject(savedProject);
      setSelectedTaskDept(savedDept);

      handleTaskShowTableClick(user.emp_id); // ✅ Refetch data on load
    }
  }, []);

  useEffect(() => {
    if (modalType === "status" && editingRow && selectedStatus) {
      handleStatusChange(selectedStatus);
    }
  }, [editingRow, selectedStatus]);

  const updateTimeInDatabase = async (formattedTime) => {};

  useEffect(() => {
    if (selectedTaskProject) {
      setSelectedRowData(null);
      localStorage.removeItem("selectedShotTaskRowData");
      console.log("Reset Task Row Data on project Change");
    }
  }, []);

  const messageContainer = document.createElement("div");
  messageContainer.style.position = "fixed";
  messageContainer.style.bottom = "20px";
  messageContainer.style.left = "50%";
  messageContainer.style.transform = "translateX(-50%)";
  messageContainer.style.zIndex = "9999";
  document.body.appendChild(messageContainer);

  const fetchProjOptions = async () => {
    try {
      const response = await axios.get(`http://${ip_port}/projects_list/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const projectCodes = response.data;
      console.log("projectCodes", projectCodes);
      setTaskProjOptions(projectCodes);
      return projectCodes;
    } catch (error) {
      console.error("Error fetching project codes:", error);
      return [];
    }
  };

  const fetchDeptOptions = () => {
    const savedAuthorizedHeaders = JSON.parse(
      localStorage.getItem("biddingTaskAuthorizedHeaders")
    );
    if (savedAuthorizedHeaders && savedAuthorizedHeaders.length > 0) {
      setTaskDeptOptions(savedAuthorizedHeaders);
    } else {
      setTaskDeptOptions(AuthorizedHeaders);
    }
  };

  const fetchProjDepts = async (project) => {
    console.log("tasks depts list token", accessToken);
    console.log("projecttt", project);
    try {
      const response = await axios.get(`http://${ip_port}/projects/`, {
        params: {
          project_code: project,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = response.data;
      console.log("tasksssproject", data);

      console.log("data", data);
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Unexpected data format or empty data array.");
      }

      return eval(data[0].departments);
    } catch (error) {
      console.error("Error fetching project departments data:", error);
      return null;
    }
  };

  const resetToInitialStatesShots = () => {
    setSelectedTaskProject("select");
    localStorage.setItem("tasksSelectedProject", "select");

    setSelectedTaskDept("select");
    localStorage.setItem("tasksSelectedDept", "select");

    setTaskShowTable(false);

    setTaskAuthorizedDepartments([]);
  };

  const handleTasksProjClick = async (e) => {
    if (e.key === "select") {
      // message.warning("Select an option");
      notification.warning({
        description: "Select an option",
      });
      resetToInitialStatesShots();
      return;
    }

    setSelectedTaskProject(e.key);
    localStorage.setItem("tasksSelectedProject", e.key);

    setSelectedTaskDept("select");
    localStorage.setItem("tasksSelectedDept", "select");

    setTaskShowTable(false);
    // localStorage.setItem("biddingShowTable", false);
    // setData([]);
    // setColumns([]);

    const shotProjDepts = await fetchProjDepts(e.key, accessToken);
    console.log("projDepts", eval(shotProjDepts));
    setTaskAuthorizedDepartments(shotProjDepts);
  };

  const handleTasksDeptClick = (e) => {
    if (e.key === "select") {
      // message.warning("Select an option");
      notification.warning({
        description: "Select an option",
      });
      setSelectedTaskDept(null);
      localStorage.setItem("tasksSelectedDept", "select");

      setTaskShowTable(false);
    } else {
      setSelectedTaskDept(e.key);
      localStorage.setItem("tasksSelectedDept", e.key);

      setTaskShowTable(false);
    }
  };

  const getStoredTableState = () => {
    const storedState = localStorage.getItem("tasktableState");
    return storedState ? JSON.parse(storedState) : {};
  };

  const storedState = getStoredTableState();

  const [tableParams, setTableParams] = useState({
    // pagination: storedState.pagination || { pageSize: 10 },
    filters: storedState.filters || {},
    sorter: storedState.sorter || {},
  });

  useEffect(() => {
    const savedData = localStorage.getItem("finalTaskData");

    const savedTableState = getStoredTableState();

    // setRestoredFromLocal(true);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setTaskData(parsedData);
      // setRestoredFromLocal(true);
      if (parsedData.length > 0) {
        const regeneratedColumns = SHOTTASKSHEADERS.filter(
          (key) => key !== "_id"
        ).map((key, index) => ({
          title: key.toUpperCase(),
          dataIndex: key,
          key: key,
          width: calculateColumnWidth(key, parsedData),
          ellipsis: true,
          fixed: index < 4 ? "left" : false,
          filters: [
            ...new Set(parsedData.map((item) => item[key]).filter(Boolean)),
          ].map((value) => ({ text: String(value), value })),

          filteredValue: tableParams.filters?.[key] || null,
          filterSearch: true,
          onFilter: (value, record) => record[key] === value,
          sorter: (a, b) => {
            if (typeof a[key] === "number") return a[key] - b[key];
            if (typeof a[key] === "string") return a[key].localeCompare(b[key]);
            return 0;
          },
          sortDirections: ["descend", "ascend"],
          sortOrder:
            tableParams.sorter?.columnKey === key
              ? tableParams.sorter?.order
              : null,
          onCell: (record) => ({
            onDoubleClick: () => handleCellDoubleClick(record, key),
          }),
        }));

        setTaskColumns(regeneratedColumns);
      }
    }
  }, [tableParams.sorter]);
  // }, []);

  const handleTableChange = (pagination, filters, sorter) => {
    const newState = {
      pagination,
      filters,
      sorter: sorter.columnKey ? sorter : {},
    };
    setTableParams(newState);
    localStorage.setItem("tasktableState", JSON.stringify(newState));

    // console.log("pagination", currentPage);
    setCurrentPage(pagination.current);
    // console.log("pagination", currentPage);
  };

  const calculateColumnWidth = (key, data) => {
    const padding = 40;
    const maxLength = Math.max(
      ...data.map((item) => (item[key] ? item[key].toString().length : 0)),
      key.length
    );

    let calculatedWidth = maxLength * 10 + padding;

    return Math.min(Math.max(120, calculatedWidth), 800);
  };

  const handleTaskShowTableClick = async (user_id) => {
    try {
      let params = {
        proj: selectedTaskProject,
      };

      if (designation === "Artist") {
        params.artist_id = user_id;
      } else if (designation === "Team Leader") {
        if (
          selectedTaskDept &&
          selectedTaskDept !== "All" &&
          selectedTaskDept !== "select"
        ) {
          params.department = selectedTaskDept;
        } else {
          // message.warning("Please select a department.");

          notification.warning({ description: "Please select a department." });
          return;
        }
      } else if (designation === "Manager" || designation === "Supervisor") {
        if (
          selectedTaskDept === "All" ||
          !selectedTaskDept ||
          selectedTaskDept === "select"
        ) {
          params.department = selectedTaskDept;
        } else {
          params.department = [selectedTaskDept];
        }
      } else {
        if (selectedTaskDept) {
          params.department = [selectedTaskDept];
        }
      }

      console.log("Final Params: ", params);
      console.log("selectedTaskDept", selectedTaskDept);
      // await handleTaskShowTable(params);

      const savedState = getStoredTableState();
      if (savedState?.sorter?.columnKey) {
        setTableParams(savedState);
      }

      // ✅ Delay slightly to ensure state is committed before columns use it
      setTimeout(() => {
        handleTaskShowTable(params);
      }, 0);
    } catch (error) {
      console.error("Error handling Show Table click:", error);
    }
  };

  const shouldCellBeEditable = (columnKey) => {
    console.log("columnKey", columnKey);
    if (designation === "Supervisor") {
      return ["description", "supervisor_comment"].includes(columnKey);
    } else if (designation === "Team Leader") {
      return ["description", "team_leader_comment", "status"].includes(
        columnKey
      );
    } else if (designation === "Manager") {
      return ["description", "a_i_status"].includes(columnKey);
    }
    return false;
  };

  const handleCellDoubleClick = async (record, columnKey) => {
    console.log("columnKey", columnKey);
    console.log("designationn", designation);
    console.log("record", record);
    console.log(record.artist_id === user.emp_id);
    // if (columnKey === "status" && designation === "Artist" || columnKey === "status" && designation === "Team Leader"  ) {
    if (
      columnKey === "status" &&
      (designation === "Artist" || designation === "Team Leader")
    ) {
      // if (record.artist_id === user.emp_id ) {
      const currentStatus = record.status;

      console.log("currentStatus", currentStatus);
      const options = status_order[currentStatus] || [];

      console.log("options", options);
      if (options.length === 0) {
        // message.info("No further status transitions available.");
        notification.info({
          description: "No further status transitions available.",
        });
        return;
      }

      setEditingRow(record);
      setSelectedStatus(options[0]);
      setStatusOptions(options);
      setModalType("status");
      // handleStatusChange(options[0]);
      // setIsStatusModalVisible(true);
      setTimeout(() => setIsStatusModalVisible(true), 100);
    } else if (columnKey === "artist_comment" && designation === "Artist") {
      setEditingRow(record);
      setArtistComment(record.artist_comment || "");
      setModalType("comment");
      // setIsStatusModalVisible(true);
      // handleStatusChange(options[0]);
      setTimeout(() => setIsStatusModalVisible(true), 100);
    } else if (shouldCellBeEditable(columnKey)) {
      setEditingRow(record);
      setModalType(columnKey);

      if (columnKey === "a_i_status") {
        setAiStatus(record.a_i_status || "");
        setIsDescriptionModalVisible(true);
      } else {
        setModalValue(record[columnKey] || "");
        setIsDescriptionModalVisible(true);
      }
    }
  };

  const showTaskName = async (artistId) => {
    try {
      const response = await axios.get(`http://${ip_port}/wip_task_details/`, {
        params: { artist_id: artistId },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      console.log("responsetaskname", response.data);

      message.warning({
        content: (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "16px",
            }}
          >
            <p>This artist has WIP tasks. Status update is blocked.</p>

            {/* style={{ textAlign:"center",paddingLeft:"1px",margin:"2px"}} */}

            <Input.TextArea
              title="WIP Tasks"
              rows={4}
              // value={JSON.stringify(response.data)}
              value={`Project: ${response.data.proj}\nTask Name: ${response.data.task_name}`}
              readOnly
              style={{ width: "100%", resize: "none", marginBottom: "12px" }}
            />
            <div>
              <Button
                type="primary"
                style={{ marginTop: "8px" }}
                onClick={() => message.destroy()}
              >
                OK
              </Button>
            </div>
          </div>
        ),
        // duration: 5,
        duration: 0,
        // style: {
        //   width: "420px",
        //   position:"fixed",
        //   bottom:"20px",
        //   left:"50%",
        //   transform:"translateX(-50%)",
        //  },
        // placement:"bottom",
        getContainer: () => messageContainer,
      });
    } catch (error) {
      console.error("Error fetching task details:", error);
      message.error("Failed to load task details.");
    }
  };

  const handleReassignConfirm = async () => {
    console.log("newArtistId", newArtistId);
    console.log("selectedEmpName", selectedEmpName);

    if (!newArtistId) {
      console.log("select new artist");
      // message.warning("Please select a new artist.");
      notification.warning({
        description: "Please select a new artist.",
      });
      return;
    }

    if (newArtistId === selectedRowData.artist_id) {
      // message.error(
      //   "Selected artist is same as current artist. Please choose a different artist."
      // );

      notification.error({
        description:
          "Selected artist is same as current artist. Please choose a different artist.",
      });

      return;
    }

    const timeToMandays = (timeString) => {
      const [hours, minutes, seconds] = timeString.split(":").map(Number);
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      const mandays = totalSeconds / (7.5 * 3600); // 1 manday = 7.5 hours
      return Number(mandays.toFixed(2));
    };

    // const mandaysToHours = (mandays) => {
    //   let total_seconds = mandays * 27000;
    //   let hours = Math.floor(total_seconds / 3600);
    //   let mins = Math.floor(total_seconds % 3600) / 60;
    //   let seconds = total_seconds % 60;
    //   return `${hours}:${mins}:${seconds}`;
    // };

    const mandaysToHours = (mandays) => {
      const totalSeconds = mandays * 7.5 * 3600; // 7.5 hours = 1 manday
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.floor(totalSeconds % 60);

      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}:${String(seconds).padStart(2, "0")}`;
    };

    const { _id, mandays, hours, hours_spent, status } = selectedRowData;

    const [h, m, s] = hours.split(":").map(Number);
    const totalMinutes = h * 60 + m + s / 60;

    const new_mandays = timeToMandays(hours_spent) || 0;
    const new_hours = hours_spent;

    const new_status = totalMinutes < 10 ? "HOLD" : "DONE";
    console.log("hours_spent", hours_spent);
    console.log("new_mandays", new_mandays, "new_hours", new_hours);

    const updatedData = {
      mandays: new_mandays,
      hours: new_hours,
      status: new_status,
    };

    try {
      await axios.patch(
        `http://${ip_port}/assign_shot_task/${_id}/`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      // message.success("Reassigned successfully!");
      notification.success({
        description: "Reassigned successfully!",
      });

      const updatedRows = taskData.map((row) =>
        row._id === _id ? { ...row, ...updatedData } : row
      );
      setTaskData(updatedRows);
      localStorage.setItem("finalTaskData", JSON.stringify(updatedRows));

      const onlyRequiredKeys = [
        "proj",
        "reel",
        "priority",
        "scene",
        "shot",
        "type",
        "frames",
        "duration",
        "thumbnail",
        "exr",
        "sow",
        "cgi_character",
        "cgi_creature",
        "cgi_asset",
        "department",
        "field",
      ];

      const filtered_Object = {};
      onlyRequiredKeys.forEach((key) => {
        if (key in selectedRowData) {
          filtered_Object[key] = selectedRowData[key];
        }
      });

      const remainingMandays = Number(mandays) - Number(new_mandays);
      const remainingHours = mandaysToHours(remainingMandays);

      const newTaskObject = {
        ...filtered_Object,
        // department: selectedTaskDept,
        // field: "mandays",
        task_name: `${selectedRowData.shot}_${selectedRowData.field}_${newArtistId}`,
        mandays: remainingMandays,
        hours: remainingHours,
        artist_id: newArtistId,
        artist_name: selectedEmpName,
        assigned_by: user.emp_id,
      };

      console.log("Creating dynamic task object:", newTaskObject);

      const response = await axios.post(
        `http://${ip_port}/assign_shot_task/`,
        JSON.stringify(newTaskObject),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log("responseeeeeee", response.data);
      // message.success("Reassigned and new task created!");
      notification.success({
        description: "Reassigned and new task created!",
      });
      setIsReassignModalVisible(false);
      await handleTaskShowTableClick(user.emp_id);
    } catch (error) {
      console.error("Reassign failed:", error);
      notification.error({ description: "Failed to reassign or create task." });
    }
  };

  //     setIsReassignModalVisible(false);
  //   } catch (error) {
  //     console.error("Reassign failed:", error);
  //     message.error("Failed to reassign task.");
  //   }
  // };

  const handleStatusChange = async (value) => {
    console.log("value", value);
    setSelectedStatus(value);
    // console.log()
    // If current status is YTS and user selects WIP
    const currentStatus = editingRow?.status;
    const allowedNextStatuses = status_order[currentStatus] || [];
    console.log("editingRow", editingRow);
    console.log("currentStatus", currentStatus);
    console.log("allowedNextStatuses", allowedNextStatuses);
    // if (editingRow?.status === "YTS" && value === "WIP") {
    if (value === "WIP" && allowedNextStatuses.includes("WIP")) {
      try {
        const response = await axios.get(
          `http://${ip_port}/assign_shot_task/`,
          {
            params: { artist_id: editingRow.artist_id, status: "WIP" },
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        console.log("length_of_the_response_data", response.data.length);
        if (response.data.length >= 1) {
          showTaskName(user.emp_id);
          // setSelectedStatus("");
          setIsTimerRunning(true);
          // setIsTimerRunning(false)
          setIsStatusBlocked(true);
          // setWipTaskNameModal(true)

          return;
        } else {
          setIsStatusBlocked(false);
          setIsTimerRunning(false);
        }
      } catch (error) {
        console.error("Error checking artist tasks:", error);
        notification.error({
          description: "Failed to verify artist task status.",
        });
        setSelectedStatus("");

        return;
      }
    } else {
      setIsTimerRunning(false);
    }
  };

  const handleTaskShowTable = async ({
    proj = "none",
    artist_id = "none",
    department = "none",
  }) => {
    try {
      setTaskShowTable(true);
      localStorage.setItem("tasksShowTable", true);

      const params = {};

      if (proj !== "none") {
        params.proj = proj;
      }
      if (artist_id !== "none") {
        params.artist_id = artist_id;
      }
      const finalDepartment =
        department !== "none" ? department : selectedTaskDept;
      console.log("finalDepartment", finalDepartment);

      if (
        finalDepartment &&
        finalDepartment !== "select" &&
        finalDepartment !== "none"
      ) {
        params.department = Array.isArray(finalDepartment)
          ? finalDepartment
          : [finalDepartment];
        // }
      }
      console.log("Final Params:", params);

      const response = await axios.get(`http://${ip_port}/assign_shot_task/`, {
        params,

        paramsSerializer: (params) => {
          return qs.stringify(params, { arrayFormat: "repeat" });
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Fetched task data:", response.data);

      const responseTaskData = response.data;

      setTaskData(responseTaskData);
      if (!responseTaskData || responseTaskData.length === 0) {
        notification.error({
          description: "No data available for this project.",
        });
      }

      console.log("responsetaskdata", responseTaskData);
      localStorage.setItem("finalTaskData", JSON.stringify(responseTaskData));

      if (response.data.length > 0) {
        // const generatedColumns = Object.keys(response.data[0])
        const generatedColumns = SHOTTASKSHEADERS.filter(
          (key) => key !== "_id"
        ).map((key, index) => ({
          title: key.toUpperCase(),

          dataIndex: key,
          key: key,
          // width: calculateColumnWidth(key, taskData),
          width: calculateColumnWidth(key, responseTaskData),
          ellipsis: true,
          fixed: index < 4 ? "left" : false,
          // filters: [
          //   // ...Array.from(new Set(taskData.map((item) => item[key]))).map(
          //   ...Array.from(
          //     new Set(response.data.map((item) => item[key]))
          //   ).map((value) => ({
          //     text: value,
          //     value: value,
          //   })),
          // ],
          filters: response.data?.length
            ? [
                ...new Set(
                  response.data.map((item) => item[key]).filter(Boolean)
                ),
              ].map((value) => ({
                text: String(value),
                value,
              }))
            : [],

          // filteredValue: tableParams.filters?.[key] || null,
          filteredValue:
            tableParams?.filters?.[key]?.length > 0 &&
            new Set(responseTaskData.map((item) => item[key])).has(
              tableParams.filters[key][0]
            )
              ? tableParams.filters[key]
              : null,

          filterSearch: true,
          onFilter: (value, record) => record[key] === value,
          // onFilter: (value, record) =>{
          //   if (key === "status") {
          //     return record[key] === value;
          //   }
          //   return true;
          // },
          sorter: (a, b) => {
            if (typeof a[key] === "number") {
              return a[key] - b[key];
            } else if (typeof a[key] === "string") {
              return a[key].localeCompare(b[key]);
            }
            return 0;
          },

          sortDirections: ["descend", "ascend"],

          sortOrder:
            tableParams.sorter?.columnKey === key
              ? tableParams.sorter?.order
              : null,

          onCell: (record) => ({
            onDoubleClick: () => handleCellDoubleClick(record, key),
          }),
        }));
        setTaskColumns(generatedColumns);
        // localStorage.setItem(
        //   "finalTaskColumns",
        //   JSON.stringify(generatedColumns)
        // );
        console.log("generatedColumns", generatedColumns);
      } else {
        setTaskColumns([]);
      }
    } catch (error) {
      console.error("Error fetching tasks data:", error);
      notification.error({ description: "Failed to fetch task data." });
    }
  };

  const handleDescriptionModalOk = async () => {
    if (editingRow) {
      if (modalType === "a_i_status" && !aiStatus?.trim()) {
        // message.warning("Please select a status (A/I) before proceeding.");
        notification.warning({
          description: "Please select a status (A/I) before proceeding.",
        });
        return;
      }

      if (modalType !== "a_i_status" && !modalValue.trim()) {
        // message.warning(
        //   `Please enter a valid ${modalType.replace(
        //     "_",
        //     " "
        //   )} before proceeding.`
        // );
        message.warning(
          `Please enter a valid ${modalType.replace(
            "_",
            " "
          )} before proceeding.`
        );
        return;
      }

      const updatedRow = {
        ...editingRow,
        [modalType]: modalType === "a_i_status" ? aiStatus : modalValue,
      };
      const updatedData = taskData.map((item) =>
        item._id === editingRow._id ? updatedRow : item
      );

      setTaskData(updatedData);
      localStorage.setItem("finalTaskData", JSON.stringify(updatedData));

      try {
        await axios.patch(
          `http://${ip_port}/assign_shot_task/${editingRow._id}/`,
          { [modalType]: modalType === "a_i_status" ? aiStatus : modalValue },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        // message.success(
        //   `${modalType.replace("_", " ")} updated in database successfully`
        // );
        notification.success({
          description: `${modalType.replace(
            "_",
            " "
          )} updated in database successfully`,
        });
      } catch (error) {
        // message.error(
        //   `Failed to update ${modalType.replace("_", " ")} in database.`
        // );
        notification.error({
          description: `Failed to update ${modalType.replace(
            "_",
            " "
          )} in database.`,
        });
      }
    }

    setIsDescriptionModalVisible(false);
    setEditingRow(null);
    setModalValue("");
    setAiStatus(null);
  };

  const handleReassignClick = () => {
    if (!selectedRowData) {
      // message.warning("Please select a row first.");
      notification.warning({ description: "Please select a row first." });

      return;
    }

    // fetchArtistOptions();
    setNewArtistId(null);
    setIsReassignModalVisible(true);
  };

  const handleChangeToYTS = async () => {
    console.log("selectedRowData", selectedRowData);
    console.log("working");
    if (!selectedRowData) {
      // message.warning("Please select a row first.");
      notification.warning({ description: "Please select a row first." });

      return;
    }

    if (
      selectedRowData.status !== "DONE" &&
      selectedRowData.status !== "APPROVED"
    ) {
      // message.warning(
      //   "Only rows with status DONE or APPROVED can be changed to YTS."
      // );
      notification.warning({
        description:
          "Only rows with status DONE or APPROVED can be changed to YTS.",
      });
      return;
    }
    try {
      await axios.patch(
        `http://${ip_port}/assign_shot_task/${selectedRowData._id}/`,
        {
          status: "YTS",
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const updatedData = taskData.map((item) =>
        item._id === selectedRowData._id ? { ...item, status: "YTS" } : item
      );

      setTaskData(updatedData);
      localStorage.setItem("finalTaskData", JSON.stringify(updatedData));

      const updatedRow = { ...selectedRowData, status: "YTS" };
      setSelectedRowData(updatedRow);
      localStorage.setItem("selectedTaskRowData", JSON.stringify(updatedRow));

      // message.success("Status updated to YTS successfully.");
      notification.success({
        description: "Status updated to YTS successfully.",
      });
    } catch (err) {
      console.error("Update failed:", err);
      // message.error("Failed to update status.");
      notification.error({ description: "Failed to update status." });
    }
  };

  const handleDeleteTask = async () => {
    console.log("selectedRowData", selectedRowData);
    if (!selectedRowData) {
      // message.warning("Please select a row to delete.");
      notification.warning({
        description: "Please select a row to delete.",
      });
      return;
    }

    confirm({
      title: "Are you sure you want to delete this task?",
      content: `Task: ${selectedRowData.task_name}`,
      okText: "Yes,Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const response = await axios.delete(
            `http://${ip_port}/assign_shot_task/${selectedRowData._id}/`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          console.log("response", response);
          console.log("response", response.data);
          // message.success("Task deleted successfully.");
          notification.success({ description: "Task deleted successfully." });
          setSelectedRowData(null);
          // localStorage.remove("assetTaskData", JSON.stringify(data));
          await handleTaskShowTableClick(user.emp_id);
        } catch (error) {
          console.error("Delete task error:", error);
          // message.error("Failed to delete task.");
          notification.error({ description: "Failed to delete task." });
        }
      },
    });
  };

  const handleWIPTask = async () => {
    try {
      const response = await axios.get(
        `http://${ip_port}/wip_task_details/?artist_id=${user.emp_id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const tasks = Array.isArray(response.data)
        ? response.data
        : [response.data];
      console.log("wipppp_taskss", tasks);
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
                      `${index + 1}. Project: ${task.proj}, Task: ${
                        task.task_name
                      }`
                  )
                  .join("\n")}
              </pre>
            </div>
          ),
          okText: "Close",
        });
      }

      console.log("WIP tasks:", tasks);
    } catch (error) {
      console.error("WIP tasks error:", error);
      Modal.error({
        title: "Error Fetching WIP Tasks",
        content: error.message || "An unexpected error occurred.",
      });
    }
  };

  const handleExcelExport = () => {
    if (taskData.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(taskData);

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      XLSX.writeFile(workbook, `Project_${selectedTaskProject}_Data.xlsx`);
    } else {
      console.log("No data available to export.");
    }
  };

  return (
    <div className="tasks_tab_container">
      <div style={{ textAlign: "center", marginTop: "0px" }}>
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
                <ShotsTasksProjMenu
                  taskProjOptions={taskProjOptions}
                  handleTasksProjClick={handleTasksProjClick}
                />
              }
              trigger={["click"]}
            >
              <Button style={{ width: "140px" }} id="tasks_proj_dropdown">
                {selectedTaskProject || "Select an option"}
              </Button>
            </Dropdown>
          </div>
          <div style={{ marginLeft: "8px" }}>
            <label
              htmlFor="tasks_dept_dropdown"
              style={{
                marginRight: "5px",
                textAlign: "center",
                borderRadius: "5px",
              }}
            >
              Select Dept:
            </label>
            <Dropdown
              overlay={
                <ShotsTasksDeptMenu
                  taskDeptOptions={taskDeptOptions}
                  handleTasksDeptClick={handleTasksDeptClick}
                  accessToken={accessToken}
                  designation={designation}
                />
              }
              trigger={["click"]}
            >
              <Button style={{ width: "130px" }} id="shots_dept_dropdown">
                {selectedTaskDept || "Select an Option"}
              </Button>
            </Dropdown>
          </div>

          <div>
            <Button
              type="primary"
              onClick={() => handleTaskShowTableClick(user.emp_id)}
              disabled={!selectedTaskProject}
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
                  <Button onClick={handleWIPTask}> WIP Task</Button>
                  <Button onClick={handleExcelExport}>Excel Export</Button>
                </>
              )}

              {designation === "Team Leader" && (
                <>
                  <Button>WIP Tasks</Button>
                  <Button onClick={handleChangeToYTS}>Change To YTS</Button>
                  <Button onClick={handleDeleteTask}>Delete Task</Button>
                  <Button onClick={handleReassignClick}>Re Assign</Button>

                  <Button>Edit Mandays</Button>
                  <Button onClick={handleExcelExport}>Excel Export</Button>
                </>
              )}
              {(designation === "Supervisor" || designation === "Manager") && (
                <>
                  <Button onClick={handleChangeToYTS}>Change To YTS</Button>
                  <Button onClick={handleDeleteTask}>Delete Task</Button>
                  <Button onClick={handleReassignClick}>Re Assign</Button>

                  <Button>Edit Mandays</Button>
                  <Button onClick={handleExcelExport}>Excel Export</Button>
                </>
              )}
            </>

            {/* <Button>Edit Mandays</Button>
            <Button>Change to YTS</Button>
            <Button>Re Assign</Button>
            <Button>Delete Task</Button>
            <Button>WIP Tasks</Button>
            <Button>Excel Export</Button> */}
          </div>

          {showTaskTable && selectedTaskProject && (
            <>
              <div
                style={{
                  position: "relative",
                  width: "100%", // ensures it fills container
                  marginTop: "20px",
                  marginBottom: "20px",
                }}
              >
                <TextArea
                  rows={9}
                  value={
                    loadingRowSelection
                      ? ""
                      : selectedRowData
                      ? `Selected Row:\n${Object.entries(selectedRowData)
                          .filter(([key]) => key !== "_id")
                          .map(([key, value]) => `${key}: ${value}`)

                          .join("\n")}`
                      : "No row selected"
                  }
                  readOnly
                  style={{
                    width: "100%",
                    height: "100%",
                    resize: "none",
                    opacity: loadingRowSelection ? 0.5 : 1,
                  }}
                />
                {loadingRowSelection && (
                  <div
                    style={{
                      position: "absolute",
                      top: "20px",
                      left: 0,
                      width: "100%",
                      height: "120px",
                      // height: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      pointerEvents: "none",
                    }}
                  >
                    <Spin tip="Loading row data..." />
                  </div>
                )}
              </div>

              <Table
                className="custom-table"
                columns={taskColumns}
                dataSource={taskData}
                // rowKey={(record) => record._id}
                rowKey={(record, index) => record._id || index}
                onChange={handleTableChange}
                scroll={{ x: "max-content", y: "calc(100vh - 480px)" }}
                sticky={{ offsetHeader: 0 }}
                onRow={(record) => ({
                  onClick: () => {
                    setLoadingRowSelection(true);

                    setTimeout(() => {
                      setSelectedRowData(record);
                      localStorage.setItem(
                        "selectedShotTaskRowData",
                        JSON.stringify(record)
                      );
                      setLoadingRowSelection(false);
                    }, 600);
                  },
                })}
                // pagination={tableParams.pagination}
                pagination={false}
                style={{ border: "2px solid #ccc" }}
                bordered
                // filteredValue={tableParams.filters}
              />
            </>
          )}

          {modalType && isStatusModalVisible && (
            <Modal
              title={
                modalType === "status"
                  ? "Update Status"
                  : "Update Artist Comment"
              }
              open={isStatusModalVisible}
              onOk={async () => {
                try {
                  console.log("Selected Status:", selectedStatus);
                  console.log("Media Path:", mediaPath);

                  if (modalType === "status" && !selectedStatus) {
                    // message.warning("Please select Status before proceeding.");
                    notification.warning({
                      description: "Please select Status before proceeding.",
                    });
                    return;
                  }

                  // if (selectedStatus === "READY TO REVIEW" && !mediaPath.trim()) {
                  //   message.warning("Please enter the media path before proceeding.");
                  //   return;
                  // }
                  let updatedRow = { ...editingRow };

                  if (isStatusBlocked && selectedStatus === "WIP") {
                    // message.warning(
                    //   "Status update to WIP is blocked because another WIP task already exists."
                    // );
                    notification.warning({
                      description:
                        "Status update to WIP is blocked because another WIP task already exists.",
                    });
                    return;
                  }

                  if (modalType === "status") {
                    if (
                      selectedStatus === "READY TO REVIEW" &&
                      !mediaPath.trim()
                    ) {
                      // message.warning(
                      //   "Please enter the media path before proceeding."
                      // );
                      notification.warning({
                        description:
                          "Please enter the media path before proceeding.",
                      });

                      return;
                    }

                    const patchData = { status: selectedStatus };
                    console.log("patchDataaa", patchData);
                    if (
                      selectedStatus === "WIP" &&
                      (!editingRow.a_start_date ||
                        editingRow.a_start_date === "0000-00-00")
                    ) {
                      // const today = new Date().toISOString().split("T")[0];
                      // 'YYYY-MM-DD'

                      const w_today = new Date();
                      const today =
                        w_today.toISOString().slice(0, -1) +
                        new Intl.DateTimeFormat("en-US", {
                          timeZoneName: "shortOffset",
                        })
                          .formatToParts(w_today)
                          .find((p) => p.type === "timeZoneName")
                          .value.replace("GMT", "");

                      // console.log(formattedToday);
                      // Example: 2025-09-04T16:20:45.123+05:30

                      console.log("wip_todayy", today);
                      patchData.a_start_date = today;
                    }

                    if (selectedStatus === "READY TO REVIEW") {
                      patchData.media_path = mediaPath;

                      // const today = new Date().toISOString().split("T")[0];
                      const r_today = new Date()
                      const today =
                      r_today.toISOString().slice(0, -1) +
                      new Intl.DateTimeFormat("en-US", {
                        timeZoneName: "shortOffset",
                      })
                        .formatToParts(r_today)
                        .find((p) => p.type === "timeZoneName")
                        .value.replace("GMT", "");



                      patchData.a_end_date = today;
                      console.log("ready_to_review_todayy", patchData);
                    }

                    updatedRow.status = selectedStatus;
                    if (patchData.a_start_date)
                      updatedRow.a_start_date = patchData.a_start_date;
                    if (patchData.a_end_date)
                      updatedRow.a_end_date = patchData.a_end_date;

                    // if (patchData.media_path)
                    //   updatedRow.media_path = patchData.media_path;

                    // await axios.patch(
                    //   `http://${ip_port}/assign_shot_task/${editingRow._id}/`,
                    //   {
                    //     status: selectedStatus,
                    //     ...(selectedStatus === "READY TO REVIEW" && {
                    //       media_path: mediaPath,
                    //     }),
                    //   },
                    //   {
                    //     headers: {
                    //       Authorization: `Bearer ${accessToken}`,
                    //       "Content-Type": "application/json",
                    //     },
                    //   }
                    // );

                    if (patchData.media_path) {
                      updatedRow.media_path = patchData.media_path;
                    }
                    // ip_port = "192.168.80.50:8888" the data in this ip_port is updating;

                    await axios.patch(
                      `http://${ip_port}/assign_shot_task/${editingRow._id}/`,
                      patchData, // <— send the exact fields you built
                      {
                        headers: {
                          Authorization: `Bearer ${accessToken}`,
                          "Content-Type": "application/json",
                        },
                      }
                    );

                    if (
                      patchData.status === "WIP" &&
                      window.loginLogId &&
                      editingRow?.task_name
                    ) {
                      const shot_logs = JSON.stringify({
                        proj: editingRow.proj,
                        shot: editingRow.task_name,
                        start: new Date().toLocaleTimeString("en-GB", {
                          hour12: false,
                        }),
                        status: selectedStatus,
                      });
                      console.log("is this working on status change");

                      try {
                        await axios.patch(
                          `http://${ip_port}/login_log/${window.loginLogId}/`,
                          {
                            shot: editingRow.task_name,
                            proj: editingRow.proj,
                            shot_logs: shot_logs,
                          },
                          {
                            headers: {
                              Authorization: `Bearer ${accessToken}`,
                              "Content-Type": "application/json",
                            },
                          }
                        );
                        console.log(
                          "✅ Login log updated with task_name due to WIP:",
                          editingRow.task_name
                        );
                        // window.hasWipTask = true;
                        window.dispatchEvent(
                          new CustomEvent("wipTaskStatusChange")
                        );
                      } catch (err) {
                        console.error(
                          "❌ Failed to update login log on WIP status:",
                          err
                        );
                      }
                    } else {
                      const shot_logs = JSON.stringify({
                        proj: editingRow.proj,
                        shot: editingRow.task_name,
                        start: new Date().toLocaleTimeString("en-GB", {
                          hour12: false,
                        }),
                        status: selectedStatus,
                      });
                      try {
                        await axios.patch(
                          `http://${ip_port}/login_log/${window.loginLogId}/`,
                          {
                            shot_logs: shot_logs,
                          },
                          {
                            headers: {
                              Authorization: `Bearer ${accessToken}`,
                              "Content-Type": "application/json",
                            },
                          }
                        );
                        console.log(
                          "✅ Login log updated with task_name due to WIP:",
                          editingRow.task_name
                        );
                        // window.hasWipTask = true;
                        window.dispatchEvent(
                          new CustomEvent("wipTaskStatusChange")
                        );
                      } catch (err) {
                        console.error(
                          "❌ Failed to update login log on WIP status:",
                          err
                        );
                      }
                    }
                    // message.success("Status updated successfully");
                    notification.success({
                      description: "Status updated successfully",
                    });
                  }

                  if (modalType === "comment") {
                    if (!artistComment.trim()) {
                      // message.warning(
                      //   "Please enter a comment before proceeding."
                      // );
                      notification.warning({
                        description:
                          "Please enter a comment before proceeding.",
                      });
                      return;
                    }
                    updatedRow.artist_comment = artistComment;

                    await axios.patch(
                      `http://${ip_port}/assign_shot_task/${editingRow._id}/`,
                      { artist_comment: artistComment },
                      {
                        headers: {
                          Authorization: `Bearer ${accessToken}`,
                          "Content-Type": "application/json",
                        },
                      }
                    );
                    // message.success("Artist comment updated successfully");
                    notification.success({
                      description: "Artist comment updated successfully",
                    });
                  }

                  const updatedData = taskData.map((item) =>
                    item._id === editingRow._id ? updatedRow : item
                  );

                  console.log("updatedData", updatedData);
                  setTaskData(updatedData);
                  localStorage.setItem(
                    "finalTaskData",
                    JSON.stringify(updatedData)
                  );
                  setIsStatusModalVisible(false);
                  setEditingRow(null);
                  setMediaPath("");
                  setArtistComment("");
                } catch (error) {
                  console.error("Error updating:", error);
                  // message.error("Failed to update in the database.");
                  notification.error({
                    description: "Failed to update in the database.",
                  });
                }
              }}
              onCancel={() => {
                setIsStatusModalVisible(false);
                setEditingRow(null);
                setMediaPath("");
                setArtistComment("");
              }}
            >
              {/* Dynamic UI based on modalType */}
              {modalType === "status" && selectedStatus !== null && (
                <>
                  <Radio.Group
                    value={selectedStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    {statusOptions.map((status) => (
                      <Radio key={status} value={status}>
                        {status}
                      </Radio>
                    ))}
                  </Radio.Group>

                  {selectedStatus === "READY TO REVIEW" && (
                    <div style={{ marginTop: "10px" }}>
                      <label>Enter Media Path:</label>
                      <Input
                        placeholder="Enter media path"
                        value={mediaPath}
                        onChange={(e) => setMediaPath(e.target.value)}
                        status={
                          selectedStatus === "READY TO REVIEW" &&
                          !mediaPath.trim()
                            ? "error"
                            : ""
                        }
                      />
                    </div>
                  )}
                </>
              )}

              {modalType === "comment" && (
                <div style={{ marginTop: "10px" }}>
                  <label>Artist Comment:</label>
                  <TextArea
                    placeholder="Enter your comment"
                    value={artistComment}
                    onChange={(e) => setArtistComment(e.target.value)}
                  />
                </div>
              )}
            </Modal>
          )}

          <Modal
            title={`Update ${modalType?.replace("_", " ").toUpperCase()}`}
            open={isDescriptionModalVisible}
            onOk={handleDescriptionModalOk}
            onCancel={() => setIsDescriptionModalVisible(false)}
          >
            {modalType === "a_i_status" ? (
              <Radio.Group
                value={aiStatus}
                onChange={(e) => setAiStatus(e.target.value)}
              >
                <Radio value="A">A</Radio>
                <Radio value="I">I</Radio>
              </Radio.Group>
            ) : (
              <Input
                placeholder={`Enter ${modalType
                  ?.replace("_", " ")
                  .toLowerCase()}`}
                value={modalValue}
                onChange={(e) => setModalValue(e.target.value)}
              />
            )}
          </Modal>

          <Modal
            title="Reassign Task"
            open={isReassignModalVisible}
            onCancel={() => setIsReassignModalVisible(false)}
            onOk={handleReassignConfirm}
            width={900}
            //  styles={{
            bodyStyles={{
              height: 800,
              overflow: "auto",
              display: "flex",
            }}
          >
            <Radio.Group
              onChange={(e) => {
                const selected = e.target.value;
                const [empId, ...nameParts] = selected.split("_");
                const fullName = nameParts.join(" ");
                setNewArtistId(empId);
                setSelectedEmpName(fullName);
                // const selectedEmpId = selected.split("_")[0];

                console.log("logic", empId === selectedRowData.artist_id);
                if (empId === selectedRowData.artist_id) {
                  // message.error(
                  //   "Selected artist is same as current artist. Please choose a different one."
                  // );
                  notification.error({
                    description:
                      "Selected artist is same as current artist. Please choose a different one.",
                  });
                }
              }}
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
              value={`${newArtistId}_${selectedEmpName}`}
            >
              {(globalShotsObject?.[selectedTaskDept?.toLowerCase()] || []).map(
                (artist, index) => (
                  <Radio key={index} value={artist}>
                    {artist}
                  </Radio>
                )
              )}
            </Radio.Group>
          </Modal>
        </div>
      </div>
    </div>
  );
};
export default Tasks;
