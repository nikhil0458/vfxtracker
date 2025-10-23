import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { fetchProjectList } from "./utils";
// import  { sendFilePathToOpen } from "./Login";
import  { sendFilePathToOpen } from "./WebSocketManager";
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
// import { ws } from "./Login.jsx";
// let dataToken;
// ws.onmessage = (event) => {
//   console.log("getting tokens");
//   console.log("type check", typeof event.data);
//   dataToken = JSON.parse(event.data);
//   alert(dataToken);
//   console.log("type check datatoken", typeof dataToken);
//   console.log(dataToken);
// };

const AssetsReview = () => {
  const { accessToken, user } = useAuth();
  const [assetReviewProjOptions, setAssetReviewProjOptions] = useState([]);
  const [assetReviewData, setAssetReviewData] = useState([]);
  const [assetReviewColumns, setAssetReviewColumns] = useState([]);
  const [showTable, setShowTable] = useState(
    localStorage.getItem("assetReviewShowTable") === "true"
  );

  const [selectedAssetReviewProject, setSelectedAssetReviewProject] = useState(
    localStorage.getItem("assetReviewSelectedProject") || null
  );
  const [selectedRow, setSelectedRow] = useState(() => {
    const saved = localStorage.getItem("selectedAssetReviewRow");
    return saved ? JSON.parse(saved) : null;
  });
  const [statusUpdate, setStatusUpdate] = useState(
    () => localStorage.getItem("statusUpdate") || ""
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");


  const { TextArea } = Input;
  const hasFetchedAssetReviewTable = useRef(false);
 const isFirstAssetReviewNotificationLoad = useRef(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projects = await fetchProjectList(accessToken);
        console.log("projectsassetreview", projects);
        setAssetReviewProjOptions(projects);
      } catch (error) {
        message.error("Failed to load project list");
      
       
        // <notification className="error"></notification>
        // description:"Failed to load project list"


        // notification.error({description:"Failed to load project list"});
        console.error(error);
      }
    };

    loadProjects();
  }, []);

useEffect(()=>{
  if(!hasFetchedAssetReviewTable.current && showTable && selectedAssetReviewProject){
    hasFetchedAssetReviewTable.current = true;
    handleShowTable()
  }
},[showTable, selectedAssetReviewProject])

  // useEffect(() => {
  //   if (showTable && selectedAssetReviewProject) {
  //     handleShowTable();
  //   }
  // }, [showTable, selectedAssetReviewProject]);

  const resetToInitialStatesShots = () => {
    setSelectedAssetReviewProject("select");
    localStorage.setItem("assetReviewSelectedProject", "select");

    setShowTable(false);
    localStorage.setItem("assetReviewShowTable", "false");

    setSelectedRow(null);
    localStorage.removeItem("selectedAssetReviewRow");

    setStatusUpdate("");
    localStorage.removeItem("statusUpdate");

    // setShowTable(false);
    // localStorage.setItem("biddingShowTable", false);
    // setData([]);
  };
  const handleAssetProjReviewClick = async (e) => {
    if (e.key === "select") {
      message.warning("Select an option");
      // notification.warning("Select an option");
      resetToInitialStatesShots();
      return;
    }

    setSelectedAssetReviewProject(e.key);
    localStorage.setItem("assetReviewSelectedProject", e.key);

    setShowTable(false);
    localStorage.setItem("biddingShowTable", false);
    // setData([]);
    // setColumns([]);
  };

  const AssetReviewProjMenu = ({
    assetReviewProjOptions,
    handleAssetProjReviewClick,
  }) => {

    const filteredOptions = assetReviewProjOptions.filter((option) =>
      option.toLowerCase().includes(searchText.toLowerCase())
    );
  
    return (

      <div>
      
      <Input
        placeholder="Search project"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: "8px" , width:"140px"}}
      />
      <Menu
        onClick={handleAssetProjReviewClick}
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

  const allowedKeys = [
    "proj",
    "asset_name",
    "task_name",
    "status",
    "media_path",
  ];

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
      console.log("accessToken", accessToken);
      setShowTable(true);
      localStorage.setItem("assetReviewShowTable", "true");
      const response = await axios.get(
        `http://${ip_port}/asset_tasks/?status=READY TO REVIEW`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const rawData = response.data;
      console.log("rawData of project",rawData)

      if (!rawData || rawData.length === 0) {
        if (!isFirstAssetReviewNotificationLoad.current) {
             notification.error({description: "No data available for this project."})
          }
          isFirstAssetReviewNotificationLoad.current = false;
          setAssetReviewData([]);
          setAssetReviewColumns([]);
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
        fixed: index < 3,
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

      setAssetReviewColumns(dynamicColumns);
      setAssetReviewData(formattedData);
    } catch (error) {
      console.error("Error fetching asset review tasks:", error);
      message.error("Failed to fetch asset review tasks.");

      // notification.error({description: "Failed to fetch asset review tasks."})
    }
  };

  const handleUpdateClick = async () => {
    if (!selectedRow) {
      message.warning("Please select a row.");
      // notification.warning({description:"Please select a row."})
      return;
    }
    if (!statusUpdate) {
      message.warning("Please select a status.");
      // notification.warning({description:"Please select a status."});
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
    try {
      await axios.patch(
        `http://${ip_port}/asset_tasks/${selectedRow._id}/`,

        payload,
        //  {

        //   status: statusUpdate,
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
      // notification.success({description:"Status updated successfully"});

      // Clear selections
      localStorage.removeItem("selectedAssetRow");
      localStorage.removeItem("statusUpdate");
      setSelectedRow(null);
      setStatusUpdate("");

      // Refresh table
      handleShowTable();
    } catch (error) {
      console.error("Failed to update status", error);
      // notification.error({description:"Failed to update status."})
      message.error("Failed to update status.");

    }
  };

  return (
    <div className="asset_review_container">
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
              htmlFor="asset_review_proj_dropdown"
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
                <AssetReviewProjMenu
                  assetReviewProjOptions={assetReviewProjOptions}
                  handleAssetProjReviewClick={handleAssetProjReviewClick}
                />
              }
              trigger={["click"]}
            >
              <Button  style={{width:"140px"}}id="asset_review_proj_dropdown">
                {selectedAssetReviewProject || "Select an option"}
              </Button>
            </Dropdown>
          </div>
          <Button
            type="primary"
            onClick={handleShowTable}
            disabled={!selectedAssetReviewProject}
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
                        // notification.warning("Please select a valid status.")
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
                // onClick={()=>sendFilePathToOpen("C:/Users/RnD/Desktop/WPS Office.lnk")}
                onClick={() => sendFilePathToOpen(selectedRow.media_path)}
              >
                Open Media Path
              </Button>
            </div>

            {/* 4. Table */}
            <Table
              className="custom-table"
              columns={assetReviewColumns}
              dataSource={assetReviewData}
              rowKey={(record) => record.id || record._id || record.key}
              rowSelection={{
                type: "radio",
                onChange: (selectedRowKeys, selectedRows) => {
                  const selected = selectedRows[0];
                  setSelectedRow(selected);
                  localStorage.setItem(
                    "selectedAssetReviewRow",
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

export default AssetsReview;
