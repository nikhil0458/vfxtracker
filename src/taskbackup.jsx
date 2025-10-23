import React, { useState, useEffect } from "react";
import { Menu, Dropdown, Button, Table, Spin, Alert,message, Input,Modal,Radio,Checkbox} from "antd";
import axios from "axios";
import { useAuth } from "./AuthContext";
import "./Shots.css";
import { ip_port } from "./Configs";
import { ip_port } from "./Configs";
import { ShotsTasksProjMenu } from "./shotsDropdownMenuClicks";
import { ShotsTasksDeptMenu } from "./shotsDropdownMenuClicks";
import qs from "qs";

const Tasks = () => {
  const { userControls, filteredData, accessToken, designation, user } =
    useAuth();

  const [taskProjOptions, setTaskProjOptions] = useState([]);
  const [selectedTaskProject, setSelectedTaskProject] = useState(
    localStorage.getItem("tasksSelectedProject") || null
  );

  const [selectedTaskDept, setSelectedTaskDept] = useState(
    localStorage.getItem("tasksSelectedDept") || null
  );

  const [taskDeptOptions, setTaskDeptOptions] = useState([]);

  const [AuthorizedHeaders, setAuthorizedHeaders] = useState([]);
  const [authorizedDepartments, setAuthorizedDepartments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showTaskTable, setTaskShowTable] = useState(
    JSON.parse(localStorage.getItem("tasksShowTable")) || false
  );

  const [taskColumns, setTaskColumns] = useState([]);
  const [taskData, setTaskData] = useState([]);

  const status_order = {
    YTS: ["WIP"],
    WIP: ["PAUSE", "READY TO REVIEW"],
    PAUSE: ["WIP", "READY TO REVIEW"],
    "READY TO REVIEW": [],
  };

  const [editingRow, setEditingRow] = useState(null);
  const [statusOptions, setStatusOptions] = useState([]);

  const [selectedStatus, setSelectedStatus] = useState(null);
  // const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null);
// const [artistComment, setArtistComment] = useState("");
const [mediaPath, setMediaPath] = useState("");
// const [isDesignationModalVisible, setIsDesignationModalVisible]=useState(false)
// const [description, setDescription]=useState("")
const [modalValue, setModalValue] = useState("");
const [isModalVisible,setIsModalVisible] = useState(false)
// const {TextArea} = Input;



  useEffect(() => {
    const loadInitialData = async () => {
      const savedProject = localStorage.getItem("tasksSelectedProject");
      const savedDeptOption = localStorage.getItem("tasksSelectedDept");

      const savedAuthorizedHeaders =
        JSON.parse(localStorage.getItem("shotAuthorizedHeaders")) || [];

     
      if (savedProject) {
        setSelectedTaskProject(savedProject);
        const projDepts = await fetchProjDepts(savedProject, accessToken);
        setAuthorizedDepartments(projDepts);
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
    };

    loadInitialData();
    fetchProjOptions();
    fetchDeptOptions();
  }, []);

  useEffect(() => {
    console.log("usercontrols1", userControls, typeof userControls);
    const AuthHeaders = userControls.filter((x) =>
      authorizedDepartments.includes(x)
    );

    setAuthorizedHeaders(AuthHeaders);
    localStorage.setItem(
      "biddingAuthorizedHeaders",
      JSON.stringify(AuthHeaders)
    );
    setTaskDeptOptions(AuthHeaders);
  }, [authorizedDepartments]);


  useEffect(() => {
    const savedData = localStorage.getItem("finalTaskData");
    const savedColumns = localStorage.getItem("finalTaskColumns");
  
    if (savedData) setTaskData(JSON.parse(savedData));
  
    if (savedColumns) {
      setTaskColumns(
        JSON.parse(savedColumns).map((col) => ({
          ...col,
          onCell: (record) => ({
            onDoubleClick: () => handleCellDoubleClick(record, col.dataIndex),
          }),
        }))
      );
    }
  }, []);
  
 

  const fetchProjOptions =  async(accessToken) => {
    try {
      const response = await axios.get(`http://${ip_port}/projects/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const projectCodes = response.data.map((project) => project.project_code);
      
      setTaskProjOptions(projectCodes);
      return projectCodes;
    } catch (error) {
      console.error("Error fetching project codes:", error);
      return [];
    }
  };


  const fetchDeptOptions = () => {
    const savedAuthorizedHeaders = JSON.parse(
      localStorage.getItem("biddingAuthorizedHeaders")
    );
    if (savedAuthorizedHeaders && savedAuthorizedHeaders.length > 0) {
      setTaskDeptOptions(savedAuthorizedHeaders);
    } else {
      setTaskDeptOptions(AuthorizedHeaders);
    }
  };

  const fetchProjDepts = async (project) => {
   
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

    setAuthorizedDepartments([]);
  };

  const handleTasksProjClick = async (e) => {
    if (e.key === "select") {
      message.warning("Select an option");
      resetToInitialStatesShots();
      return;
    }

    setSelectedTaskProject(e.key);
    localStorage.setItem("tasksSelectedProject", e.key);

    setSelectedTaskDept("select");
    localStorage.setItem("tasksSelectedDept", "select");

    setTaskShowTable(false);
    

    const shotProjDepts = await fetchProjDepts(e.key, accessToken);
    console.log("projDepts", eval(shotProjDepts));
    setAuthorizedDepartments(shotProjDepts);
  };

  const handleTasksDeptClick = (e) => {
    if (e.key === "select") {
      message.warning("Select an option");
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

    console.log("pagination", pagination);
    console.log("pagination", currentPage);
    setCurrentPage(pagination.current);
    console.log("pagination", currentPage);
    
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

   const handleTaskShowTableClick = async ( user_id) => {
    try {
      let params = {
        proj: selectedTaskProject,
      };
  
      if (designation === "Artist") {
        
        params.artist_id = user_id;
  
      } else if (designation === "TeamLead") {
       
        if (selectedTaskDept && selectedTaskDept !== "All" && selectedTaskDept !== "select") {
          params.department = selectedTaskDept;
          
        } else {
         
          message.warning("Please select a department.");
          return;
        }
  
      } else if (designation === "Manager" || designation === "Supervisor") {
      
        if (selectedTaskDept === "All" || !selectedTaskDept || selectedTaskDept === "select") {
          params.department = selectedTaskDept;
          
        } else {
          params.department = [selectedTaskDept];
        }
  
      } else {
        if(selectedTaskDept){
        params.department = [selectedTaskDept];
      }
    }
  
      console.log("Final Params: ", params);
      console.log("selectedTaskDept",selectedTaskDept)
      await handleTaskShowTable(params);
    } catch (error) {
      console.error("Error handling Show Table click:", error);
    }
  };
  
  const handleCellDoubleClick = (record, columnKey) => {
    console.log("columnKey",columnKey)
    console.log("designationn", designation)


   
    setEditingRow(record);

    if (columnKey === "status" && designation === "Artist") {
      const options = status_order[record.status] || [];
      setSelectedStatus(record.status);
      setStatusOptions(options);
      setModalType("status");
    } else if (columnKey === "artist_comment" && designation === "Artist") {
      setModalType("artist_comment");
      setModalValue(record.artist_comment || "");
    } else if (columnKey === "description" && (designation === "Manager" || designation === "Supervisor" || designation === "TeamLead")) {
      setModalType("description");
      setModalValue(record.description || "");
    } else if (columnKey === "supervisor_comment" && designation === "Supervisor") {
      setModalType("supervisor_comment");
      setModalValue(record.supervisor_comment || "");
    } else if (columnKey === "team_leader_comment" && designation === "TeamLead") {
      setModalType("team_leader_comment");
      setModalValue(record.team_leader_comment || "");
    }

    setIsModalVisible(true);
  };





    // if (user.emp_id !== record.artist_id) {
    //   message.error("You are not authorized to edit this field.");
    //   return;
    // }
  
    // if (columnKey === "status" && designation === "Artist") {
    //   const currentStatus = record.status;
    //   const options = status_order[currentStatus] || [];
  
    //   if (options.length === 0) {
    //     message.info("No further status transitions available.");
    //     return;
    //   }
  
    //   setEditingRow(record);
    //   setSelectedStatus(currentStatus);
    //   setStatusOptions(options); 
    //   setModalType("status");
    //   setIsStatusModalVisible(true);
    // }
  

    
    // if (columnKey === "artist_comment" && designation === "Artist") {
    //   setEditingRow(record);
    //   setArtistComment(record.artist_comment || "");
    //   setModalType("comment");
    //   setIsStatusModalVisible(true);
    // }

    // if (designation === "TeamLead" || designation === "Supervisor" || designation === "Manager")  {
    //   if (columnKey === "description") {
    //     setEditingRow(record);
    //     setDescription(record.description || "");
    //     setModalType("description");
    //     setIsDesignationModalVisible(true);
    //   }
    // }

    // if (columnKey === "description" && (designation === "Manager" || designation === "Supervisor" || designation === "TeamLead")) {
    //   setEditingRow(record);
    //   setModalValue(record.description || "");
    //   setModalType("description");
    //   setIsModalVisible(true);
    // }


    // if (columnKey === "supervisor_comment" && designation === "Supervisor") {
    //   setEditingRow(record);
    //   setModalValue(record.supervisor_comment || "");
    //   setModalType("supervisor_comment");
    //   setIsModalVisible(true);
    // }

    // if (columnKey === "team_leader_comment" && designation === "TeamLead") {
    //   setEditingRow(record);
    //   setModalValue(record.team_leader_comment || "");
    //   setModalType("team_leader_comment");
    //   setIsModalVisible(true);
    // }
  


    // }


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
      console.log("response", response);
      console.log("params", params);
      console.log("Fetched task data:", response.data);

      const responseTaskData = response.data;
      setTaskData(responseTaskData);
      console.log("responsetaskdata",responseTaskData)
      localStorage.setItem("finalTaskData", JSON.stringify(responseTaskData));

     

      if (response.data.length > 0) {
        const generatedColumns = Object.keys(response.data[0])
          .filter((key) => key !== "_id")

          .map((key, index) => ({
            title: key.toUpperCase(),
            dataIndex: key,
            key: key,
            width: calculateColumnWidth(key, taskData),
            ellipsis: true,
            fixed: index < 4 ? "left" : false,
            filters: [
              // ...Array.from(new Set(taskData.map((item) => item[key]))).map(
              ...Array.from(
                new Set(response.data.map((item) => item[key]))
              ).map((value) => ({
                text: value,
                value: value,
              })),
            ],

            // onFilter: (value, record) => record[key] === value,
            onFilter: (value, record) =>{
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

            sortDirections: ["descend", "ascend"],
            onCell: (record) => ({
              
              onDoubleClick: () => handleCellDoubleClick(record, key),
            }),
          }));
        setTaskColumns(generatedColumns);
        localStorage.setItem(
          "finalTaskColumns",
          JSON.stringify(generatedColumns)
        );
        console.log("generatedColumns",generatedColumns)
      } else {
        setTaskColumns([]);
      }
    } catch (error) {
      console.error("Error fetching tasks data:", error);
      message.error("Failed to fetch task data.");
    }
  };


  // const handleDescriptionModalOk = () => {
  //   if (modalType === "description" && editingRow) {
  //     const updatedRow = { ...editingRow, description };
  //     const updatedData = taskData.map((item) =>
  //       item._id === editingRow._id ? { ...item, description: updatedRow.description } : item
  //     );
  
  //     setTaskData(updatedData);
  //     localStorage.setItem("finalTaskData", JSON.stringify(updatedData));
  //   }
  //   setIsDesignationModalVisible(false);
  // };
  const handleModalOk = async () => {
    if (editingRow) {
      const updatedData = taskData.map((item) =>
        item.id === editingRow.id ? { ...item, [modalType]: modalType === "status" ? selectedStatus : modalValue } : item
      );

      setTaskData(updatedData);
      localStorage.setItem("finalTaskData", JSON.stringify(updatedData));

      try {
        await axios.patch(`http://${ip_port}/assign_shot_task/${editingRow.id}/`, { [modalType]: modalType === "status" ? selectedStatus : modalValue }, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        message.success("Data updated in database successfully.");
      } catch (error) {
        message.error("Failed to update data in database.");
      }
    }

    setIsModalVisible(false);
    setEditingRow(null);
    setModalValue("");
    setSelectedStatus(null);
    setMediaPath("");
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
                <ShotsTasksProjMenu
                  taskProjOptions={taskProjOptions}
                  handleTasksProjClick={handleTasksProjClick}
                />
              }
              trigger={["click"]}
            >
              <Button id="tasks_proj_dropdown">
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
                  handleTasksDeptClick={
                    handleTasksDeptClick
                     
                   
                  }
                  accessToken={accessToken}
                  designation={designation}
                />
              }
              trigger={["click"]}
            >
              <Button id="shots_dept_dropdown">
                {selectedTaskDept || "Select an Option"}
              </Button>
            </Dropdown>
          </div>

          <div>
            <Button
              type="primary"
              onClick={()=>
                handleTaskShowTableClick(user.emp_id)    
                
              }
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
            <Button>Edit Mandays</Button>
            <Button>Change to YTS</Button>

            <Button>WIP Tasks</Button>
            <Button>Re Assign</Button>
            <Button>Delete Task</Button>
            <Button>Exel Export</Button>
          </div>

          {showTaskTable && selectedTaskProject && (
            <Table
              className="custom-table"
              columns={taskColumns}
              dataSource={taskData}
              rowKey={(record) => record.id}
         
              onChange={handleTableChange}
              // filteredValue={tableParams.filters}
              sortOrder={tableParams.sorter?.order}
              sortedInfo={tableParams.sorter}
              agination={tableParams.pagination}
              scroll={{ x: "max-content", y: 400 }}
              style={{ marginTop: "60px", border: "2px solid #ccc" }}
              bordered
            />
          )}
           





           <Modal title={`Update ${modalType?.replace("_", " ").toUpperCase()}`} open={isModalVisible} onOk={handleModalOk} onCancel={() => setIsModalVisible(false)}>
        {modalType === "status" ? (
          <Radio.Group value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            {statusOptions.map((status) => <Radio key={status} value={status}>{status}</Radio>)}
          </Radio.Group>
        ) : (
          <Input.TextArea value={modalValue} onChange={(e) => setModalValue(e.target.value)} placeholder="Enter text" rows={4} />
        )}

        {modalType === "status" && selectedStatus === "READY TO REVIEW" && (
          <div style={{ marginTop: "10px" }}>
            <label>Enter Media Path:</label>
            <Input value={mediaPath} onChange={(e) => setMediaPath(e.target.value)} placeholder="Enter media path" />
          </div>
        )}
      </Modal>














{/* 

           
    <Modal
    title={modalType === "status" ? "Update Status" : "Update Artist Comment"}
    open={isStatusModalVisible}
    onOk={async () => {
    try {
      let updatedRow = { ...editingRow };

      if (modalType === "status") {
        updatedRow.status = selectedStatus;
        if (selectedStatus === "READY TO REVIEW") {
          updatedRow.media_path = mediaPath;
        }

        await axios.patch(
          `http://${ip_port}/assign_shot_task/${editingRow._id}/`, 
          { 
            status: selectedStatus,
            ...(selectedStatus === "READY TO REVIEW" && { media_path: mediaPath }) 
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        message.success("Status updated successfully");
      } 

      if (modalType === "comment") {
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
        message.success("Artist comment updated successfully");
      }

      const updatedData = taskData.map((item) =>
        item.key === editingRow.key ? updatedRow : item
      );

      setTaskData(updatedData);
      localStorage.setItem("finalTaskData", JSON.stringify(updatedData)); 
      setIsStatusModalVisible(false);
      setEditingRow(null);
      setMediaPath(""); 
      setArtistComment(""); 
    } catch (error) {
      console.error("Error updating:", error);
      message.error("Failed to update in the database.");
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
  {/* {modalType === "status" && (
    <>
      <Radio.Group
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
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
          />
        </div>
      )}
    </>
  )} */}

  {/* {modalType === "comment" && (
    <div style={{ marginTop: "10px" }}>
      <label>Artist Comment:</label>
      <TextArea
        placeholder="Enter your comment" 
        value={artistComment}
        onChange={(e) => setArtistComment(e.target.value)}
      />
    </div>
  )}

</Modal> */}


{/* {modalType === "description" && (designation === "Manager" || designation === "Supervisor" || designation === "TeamLead")&&(
   <Modal
   title="Update Description"
   open={isDesignationModalVisible}
   onOk={handleDescriptionModalOk}
   onCancel={() => setIsDesignationModalVisible(false)}
 >
   <Input
     placeholder="Enter description"
     value={description}
     onChange={(e) => setDescription(e.target.value)}
   />
 </Modal>
 )} */}

       </div>
      </div>
    </div>
  );
};
export default Tasks;




 // const handleDescriptionModalOk = () => {
  //   if (modalType === "description" && editingRow) {
  //     const updatedRow = { ...editingRow, description };
  //     setTaskData((prevData) => prevData.map((item) => (item.key === editingRow.key ? updatedRow : item)));
  //     // localStorage.setItem("finalTaskData", JSON.stringify(taskData));
  //   }
  //   setIsDescriptionModalVisible(false);
  // };

{/* <Modal */}
// title="Update Status"
// open={isStatusModalVisible}
// onOk={async () => {
//   try {
 
//     const updatedRow = { ...editingRow, status: selectedStatus, 
//       media_path:selectedStatus === "READY TO REVIEW" ? mediaPath : editingRow.media_path };

//     await axios.patch(
//       `http://${ip_port}/assign_shot_task/${editingRow._id}/`, 
//       { status: selectedStatus ,
//         ...(selectedStatus === "READY TO REVIEW" && { media_path: mediaPath }) 
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const updatedData = taskData.map((item) =>
//       item.key === editingRow.key ?
//     //  updatedRow 
//     { ...item, status: selectedStatus, media_path: selectedStatus === "READY TO REVIEW" ? mediaPath : item.media_path}
//      : 
//      item
//     );
//     setTaskData(updatedData);
//     localStorage.setItem("finalTaskData", JSON.stringify(updatedData)); 
//     setIsStatusModalVisible(false);
//     setEditingRow(null);
//   } catch (error) {
//     console.error("Error updating status:", error);
//     message.error("Failed to update status in the database.");
//   }
// }}
// onCancel={() => {
//   setIsStatusModalVisible(false);
//   setEditingRow(null);
//   setMediaPath("");
// }}
// >
{/* <Radio.Group
  value={selectedStatus}
  onChange={(e) => setSelectedStatus(e.target.value)}
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
/>
</div> */}
{/* )} */}
{/* </Modal> */}




 // if (columnKey !== "status") return;

    // if (user.emp_id === record.artist_id) {
    //   const currentStatus = record.status;

    //   const options = status_order[currentStatus] || [];

    //   if (options.length === 0) {
    //     message.info("No further status transitions available.");
        
    //     return;


    // if (user.emp_id !== record.artist_id) {
    //   message.error("You are not authorized to edit this field.");
    //   return;
    // }
  
    // if (columnKey === "status") {
    //   const currentStatus = record.status;
    //   const options = status_order[currentStatus] || [];
  
    //   if (options.length === 0) {
    //     message.info("No further status transitions available.");
    //     return;
    //   }
  
    //   setEditingRow(record);
    //   setSelectedStatus(currentStatus);
    //   setStatusOptions(options); 
    //   setIsStatusModalVisible(true);
    // }
  
    // if (columnKey === "artist_comment") {
    //   setEditingRow(record);
    //   setArtistComment(record.artist_comment || "");
    //   setIsArtistCommentModalVisible(true);
    // }

   // setEditingRow(record);
      // setSelectedStatus(currentStatus);
      // setStatusOptions(options); 
      // setIsStatusModalVisible(true);
    // } else {
    //   message.error("You are not authorized to edit this status.");
    // }
  





 // const handleDescriptionModalOk = () => {
  //   if (modalType === "description" && editingRow) {
  //     const updatedRow = { ...editingRow, description };
  //     setTaskData((prevData) => prevData.map((item) => (item.key === editingRow.key ? updatedRow : item)));
  //     // localStorage.setItem("finalTaskData", JSON.stringify(taskData));
  //   }
  //   setIsDescriptionModalVisible(false);
  // };

{/* <Modal */}
// title="Update Status"
// open={isStatusModalVisible}
// onOk={async () => {
//   try {
 
//     const updatedRow = { ...editingRow, status: selectedStatus, 
//       media_path:selectedStatus === "READY TO REVIEW" ? mediaPath : editingRow.media_path };

//     await axios.patch(
//       `http://${ip_port}/assign_shot_task/${editingRow._id}/`, 
//       { status: selectedStatus ,
//         ...(selectedStatus === "READY TO REVIEW" && { media_path: mediaPath }) 
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const updatedData = taskData.map((item) =>
//       item.key === editingRow.key ?
//     //  updatedRow 
//     { ...item, status: selectedStatus, media_path: selectedStatus === "READY TO REVIEW" ? mediaPath : item.media_path}
//      : 
//      item
//     );
//     setTaskData(updatedData);
//     localStorage.setItem("finalTaskData", JSON.stringify(updatedData)); 
//     setIsStatusModalVisible(false);
//     setEditingRow(null);
//   } catch (error) {
//     console.error("Error updating status:", error);
//     message.error("Failed to update status in the database.");
//   }
// }}
// onCancel={() => {
//   setIsStatusModalVisible(false);
//   setEditingRow(null);
//   setMediaPath("");
// }}
// >
{/* <Radio.Group
  value={selectedStatus}
  onChange={(e) => setSelectedStatus(e.target.value)}
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
/>
</div> */}
{/* )} */}
{/* </Modal> */}




 // if (columnKey !== "status") return;

    // if (user.emp_id === record.artist_id) {
    //   const currentStatus = record.status;

    //   const options = status_order[currentStatus] || [];

    //   if (options.length === 0) {
    //     message.info("No further status transitions available.");
        
    //     return;


    // if (user.emp_id !== record.artist_id) {
    //   message.error("You are not authorized to edit this field.");
    //   return;
    // }
  
    // if (columnKey === "status") {
    //   const currentStatus = record.status;
    //   const options = status_order[currentStatus] || [];
  
    //   if (options.length === 0) {
    //     message.info("No further status transitions available.");
    //     return;
    //   }
  
    //   setEditingRow(record);
    //   setSelectedStatus(currentStatus);
    //   setStatusOptions(options); 
    //   setIsStatusModalVisible(true);
    // }
  
    // if (columnKey === "artist_comment") {
    //   setEditingRow(record);
    //   setArtistComment(record.artist_comment || "");
    //   setIsArtistCommentModalVisible(true);
    // }

   // setEditingRow(record);
      // setSelectedStatus(currentStatus);
      // setStatusOptions(options); 
      // setIsStatusModalVisible(true);
    // } else {
    //   message.error("You are not authorized to edit this status.");
    // }
  

  //  const handleShowTable = async(accessToken, refreshToken)=>{
  //    const response = await axios.get(`http://{ip_port}/assigned_shot_tasks`,{
  //     params:{
  //       "accessToken": accessToken,
  //       "refreshToken": refreshToken,

  //     },
  //     headers:{
  //       Authorization: `Bearer ${accessToken}`,
  //       "Content-Type":"application/json",
  //     },
   
  //    })
  //    console.log("response", response)
  //    const data = response.data;
  //    console.log("data",data)
  //  }
  //  handleShowTable()