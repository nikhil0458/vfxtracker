import React, { useState, useEffect, useRef } from "react";
import { ip_port } from "./Configs";
import {
  Menu,Dropdown,Button,Table,Spin,Alert,Input,Modal,message,InputNumber,Radio,Checkbox,Switch,notification
} from "antd";
import axios from "axios";
import { UploadOutlined } from "@ant-design/icons";
import "./Bidding.css";
import * as XLSX from "xlsx";
import { useAuth } from "./AuthContext";

const Bidding = () => {
  const { userControls, filteredData, accessToken, designation,user } = useAuth();
  console.log("userControls",userControls, "filteredData",filteredData, "accessToken",accessToken, "designation", designation, "user",user)
  const [selectedProject, setSelectedProject] = useState(
    localStorage.getItem("biddingSelectedProject") || null
  );
  const [selectedMicroOption, setSelectedMicroOption] = useState(
    localStorage.getItem("biddingSelectedMicroOption") || null
  );


  const [showTable, setShowTable] = useState(() => {
    return localStorage.getItem("biddingShowTable") || false;
  });
  
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [options1, setOptions1] = useState([]);
  const [options2, setOptions2] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [newValue, setNewValue] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [isRadioModalVisible, setIsRadioModalVisible] = useState(false);
  const [radioOptions, setRadioOptions] = useState([]);
  const [selectedRadioValue, setSelectedRadioValue] = useState("");
  const [islocked, setIsLocked] = useState();

  const [isThumbnailModalVisible, setIsThumbnailModalVisible] = useState(false);
  const [exrModalVisible, setExrModalVisible] = useState(false);

  const [thumbnailPath, setThumbnailPath] = useState("");
  const [exrPath, setExrPath] = useState("");
  const [authorizedDepartments, setAuthorizedDepartments] = useState([]);
  const fileInputRef = useRef(null);
  const fileInputRefThumbnail = useRef(null);
  const fileInputRefMandays = useRef(null);
  const [AuthorizedHeaders, setAuthorizedHeaders] = useState([]);

  const [isBidDataModalVisible, setIsBidDataModalVisible] = useState(false);
  const [createdCount, setCreatedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

  const [rejectedObjects, setRejectedObjects] = useState([]);
  const [isThumbnailDataModalVisible, setIsThumbnailDataModalVisible] =
    useState(false);
  const [createdThumbnailCount, setCreatedThumbnailCount] = useState(0);
  const [rejectedThumbnailCount, setRejectedThumbnailCount] = useState(0);

  const [rejectedThumbnailObjects, setRejectedThumbnailObjects] = useState([]);
  const [isMandaysDataModalVisible, setIsMandaysDataModalVisible] =
    useState(false);

  const [updatedObjectsMandaysCount, setUpdatedObjectsMandaysCount] =
    useState(0);
  const [notUpdatedMandaysObjects, setNotUpdatedMandaysObjects] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);

  const [searchText, setSearchText] = useState("");
  // const [isInitialized, setIsInitialized] = useState(false);


  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 100 },
    filters: {},
    sorter: {},
  });
  

  const updatePending = useRef(false);

  // const prevSelectionRef = useRef({
  //   selectedProject: null,
  //   selectedMicroOption: null,
  // });
  const prevSelectionRef = useRef({
    selectedProject: localStorage.getItem("biddingSelectedProject"),
    selectedMicroOption: localStorage.getItem("biddingSelectedMicroOption"),
  });
  

  const EXPECTED_HEADERS = [
    "proj",
    "reel",
    "priority",
    "scene",
    "shot",
    "type",
    "frames",
    "thumbnail",
    "exr",
    "sow",
  ];
  useEffect(() => {
    console.log("📦 showTable changed:", showTable);
  }, [showTable]);
  
  useEffect(() => {
    const hasFilters = tableParams?.filters && Object.keys(tableParams.filters).length > 0;
    const hasData = data.length > 0;
  
    if (hasFilters && hasData) {
      console.log("📦 Force reapplying filters/sorters after tab switch (final hook)");
      updateColumns();
    }
  }, [data, tableParams]);
  




  


  // const restoreFromStorage = () => {
  //   const savedParams = JSON.parse(localStorage.getItem("bidding_tableParams"));
  //   const savedData = JSON.parse(localStorage.getItem("biddingData"));
  
  //   if (savedParams && savedData?.length > 0) {
  //     console.log("🔁 Restoring table state from localStorage");
  
  //     // updatePending.current = true;
  //     setTableParams(savedParams);
  //     setData(savedData);
  
  //     // Set restoration flag
  //     // localStorage.setItem("biddingTableRestored", "true");
  
  //     // Wait briefly for states to sync, then reapply filters/sorters
  //     setTimeout(() => {
  //       updateColumns();
  //     }, 50);
  //   }
  // };
  
  const restoreFromStorage = () => {
    const savedParams = JSON.parse(localStorage.getItem("bidding_tableParams"));
    const savedData = JSON.parse(localStorage.getItem("biddingData"));
  
    
    // const prev = prevSelectionRef.current;
  
    // if (
    //   selectedProject === prev.selectedProject &&
    //   selectedMicroOption === prev.selectedMicroOption
    // ) 
    // {
      if (savedParams) setTableParams(savedParams);
      if (savedData?.length > 0) setData(savedData);
    // } 
    // else {
    //   console.log("⛔ Project or Micro changed — not restoring old filters");
    // }
  };
  




  
  
  useEffect(() => {
    const handleTabVisibility = () => {
      if (document.visibilityState === "visible") {
       
        console.log("🔁 Tab became visible — restoring state from storage");
      restoreFromStorage();
      }
    };
  
    document.addEventListener("visibilitychange", handleTabVisibility);
    return () => document.removeEventListener("visibilitychange", handleTabVisibility);
  }, []);
 
  
  useEffect(() => {
    const loadInitialData = async () => {
      const savedProject = localStorage.getItem("biddingSelectedProject");
      const savedMicroOption = localStorage.getItem("biddingSelectedMicroOption");
      const savedShowTable = JSON.parse(localStorage.getItem("biddingShowTable"));
      // const savedAuthorizedHeaders = JSON.parse(localStorage.getItem("biddingAuthorizedHeaders")) || [];
      const savedData = JSON.parse(localStorage.getItem("biddingData"));
      const savedParams = JSON.parse(localStorage.getItem("bidding_tableParams"));
  
      if (savedProject) {
        setSelectedProject(savedProject);
        const projDepts = await fetchProjDepts(savedProject);
        console.log("🔁 projDepts from fetch:", projDepts);
        setAuthorizedDepartments(projDepts);
       
      }
  
  
      if (savedMicroOption && savedMicroOption !== "select") {
        setSelectedMicroOption(savedMicroOption);
      } else {
        setSelectedMicroOption(null);
      }
  
      // if (savedParams) {
      //   setTableParams(savedParams);
      //   // setTableRestored(true);
      // }
  

      // if (savedParams) {
      //   setTableParams(savedParams);
       
      // }
      


      if (savedShowTable) {
        setShowTable(true);


      }
      if (savedParams && savedData?.length > 0) {
        console.log("🔁 Tab visible — restoring table filters/sorting");
        setTableParams(savedParams);
        setData(savedData);
      
        // ✅ Set restore flag AFTER restoration
        // localStorage.setItem("biddingTableRestored", "true");
      
        setTimeout(() => {
          updateColumns();
        }, 50);
      }
      
      
     


     restoreFromStorage();
      updatePending.current = true;
    };
  
    loadInitialData();
  }, []);







useEffect(() => {
  const prev = prevSelectionRef.current;

  const projectChanged =
    selectedProject !== prev.selectedProject ||
    selectedMicroOption !== prev.selectedMicroOption;

  if (projectChanged) {
    console.log("🎯 Project or microOption changed — clearing filters/sorters");

    const clearedParams = {
      pagination: { current: 1, pageSize: 100 },
      filters: {},
      sorter: {},
    };

    setTableParams(clearedParams);
    localStorage.setItem("bidding_tableParams", JSON.stringify(clearedParams));
    localStorage.removeItem("biddingData"); 

    prevSelectionRef.current = {
      selectedProject,
      selectedMicroOption,
    };
  }
}, [selectedProject, selectedMicroOption]);





  useEffect(() => {
    if (updatePending.current && data.length > 0 && Object.keys(tableParams?.filters || {}).length > 0) {
      updateColumns();
      updatePending.current = false;
    }
  }, [data, tableParams]);
  
  

  


  useEffect(() => {
    if (
      showTable &&
      selectedProject &&
      selectedMicroOption &&
      authorizedDepartments.length > 0 &&
    

      data.length > 0&&
      Object.keys(tableParams?.filters || {}).length > 0
    ) {
      // isReady.current = true;
      console.log("✅ updateColumns triggered from unified effect");
      updateColumns();
    }
  }, [showTable, selectedProject, selectedMicroOption, authorizedDepartments,data,tableParams]);
  

  useEffect(() => {
    console.log("📦 Component mounted");
  }, []);
  
  useEffect(() => {
    if (data.length > 0 && columns.length > 0) {
      console.log("📦 TableParams changed — reapplying filters/sorters to columns");
      updateColumns();
    }
  }, [tableParams]);
  
  
  useEffect(() => {
    if (authorizedDepartments.length > 0 && userControls.length > 0) {
      const AuthHeaders = userControls.filter((x) =>
        authorizedDepartments.includes(x)
      );
      setAuthorizedHeaders(AuthHeaders);
      localStorage.setItem("biddingAuthorizedHeaders", JSON.stringify(AuthHeaders));
      setOptions2(AuthHeaders);
      console.log("✅ AuthHeaders calculated from latest deps:", AuthHeaders);
  
      // ✅ Immediately update columns here if data is already present
      // if (
      //   showTable &&
      //   selectedProject &&
      //   selectedMicroOption &&
      //   data.length > 0 &&
      //   AuthHeaders.length > 0
      // ) {
      //   console.log("🚀 updateColumns() called directly from AuthHeader setter");
      //   updateColumns();
      // } else {
      //   console.log("⏳ Delayed updateColumns() — data or other deps not ready yet");
      // }
    }
  }, [authorizedDepartments, userControls]);
  



  

  
  
  useEffect(() => {
    if (showTable && selectedProject && data.length === 0) {
      console.log("Auto re-fetching data because table is empty");
      fetchData(tableParams);
    }
  }, [showTable, selectedProject]);
  
  useEffect(() => {
    if (showTable && data.length > 0) {
      console.log("Data has been updated:", data);
      updateColumns();
    }
  }, [showTable, data]);
  
  useEffect(() => {
    console.log("Table data in state:", data);
  }, [data]);
  

  

  useEffect(() => {
    fetchOptions1();
    fetchOptions2();
  }, []);

  // useEffect(() => {
  //   // const restored = localStorage.getItem("biddingTableRestored");
  //   if (selectedProject || selectedMicroOption) {
  //     // if ((selectedProject || selectedMicroOption) && restored !== "true") {
  //     console.log("🎯 Project/microOption changed — resetting tableParams filters/sorters");
  
  //     setTableParams((prev) => ({
  //       ...prev,
  //       filters: {},
  //       sorter: {},
  //     }));
  
  //     localStorage.removeItem("bidding_tableParams"); 
  //   }
  // }, [selectedProject, selectedMicroOption]);
  

  useEffect(() => {
    const origSetItem = localStorage.setItem;
    localStorage.setItem = function (key, value) {
      console.log(`🪵 localStorage.setItem("${key}", ${value})`);
      if (key === "biddingShowTable") {
        console.trace("🔍 biddingShowTable was set here:");
      }
      origSetItem.apply(this, arguments);
    };
  }, []);
  
  useEffect(() => {
    console.log("🧠 Columns updated:", columns);
  }, [columns]);
  
  useEffect(() => {
    if (data.length > 0) {
      console.log("✅ Data after fetch:", data.length);
      console.log("🧠 Keys in first object:", Object.keys(data[0]));
    }
  }, [data])

  useEffect(() => {
    if (!isBidDataModalVisible) {
      setCreatedCount(0);
      setRejectedCount(0);
      setRejectedObjects([]);
    }
  }, [isBidDataModalVisible]);

  useEffect(() => {
    if (!isThumbnailDataModalVisible) {
      setCreatedThumbnailCount(0);
      setRejectedThumbnailCount(0);
      setRejectedThumbnailObjects([]);
    }
  }, [isMandaysDataModalVisible]);
  useEffect(() => {
    if (!isMandaysDataModalVisible) {
      setUpdatedObjectsMandaysCount(0);
      setNotUpdatedMandaysObjects(0);
    }
  }, [isMandaysDataModalVisible]);

  const fetchOptions1 = () => {
    console.log("accessToken====", accessToken);
    axios
      .get(`http://${ip_port}/projects_list/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      })

      .then((response) => {
        const projects = response.data;
        setOptions1(["select", ...projects]);
      })
      .catch((error) => {
        console.error("Error fetching options1:", error);
      });
  };

  // const fetchOptions2 = () => {
  //   setOptions2(AuthorizedHeaders);
  // };

  const fetchOptions2 = () => {
    const savedAuthorizedHeaders = JSON.parse(
      localStorage.getItem("biddingAuthorizedHeaders")
    );
    if (savedAuthorizedHeaders && savedAuthorizedHeaders.length > 0) {
      setOptions2(savedAuthorizedHeaders);
    } else {
      setOptions2(AuthorizedHeaders);
    }
  };

  const getHeaders = () => {
    console.log("filteredDataa", filteredData)
    const headers = [];
    headers.push(...filteredData[0].base_columns);
    console.log("filterData", filteredData);
    console.log("authDept", authorizedDepartments);
    console.log("usercon", userControls);
    let authorizedHeaders = [...new Set(userControls)].filter((x) =>
      authorizedDepartments.includes(x)
    );
    for (let header of authorizedHeaders) {
      headers.push(...filteredData[0].bid_macro[header]);
    }
    if (selectedMicroOption != null && selectedMicroOption != "select") {
      const index = headers.indexOf(selectedMicroOption.toLowerCase());
      if (index !== -1) {
        const microheaders = filteredData[0].bid_micro[selectedMicroOption];
        headers.splice(index + 2, 0, ...microheaders);
      }
    }
    headers.push("status");
    console.log("headers", headers);
    return headers;
  };

  const updateColumns = () => {

    if (data.length === 0) return;
    if (filteredData.length > 0 && userControls.length >= 0) {
      console.log("filteredDataa4",filteredData)
      const headers = getHeaders();

      const fetchedColumns = headers
        .filter((key) => key !== "_id")
        .map((key, index) => ({
          title: key,
          dataIndex: key,
          key: key,
          width: 150,
          ellipsis: true,
          fixed: index < 3 ? "left" : false,

          filters: [
            ...Array.from(new Set(data.map((item) => item[key]))).map(
              (value) => ({
                text: value,
                value: value,
              })
            ),
          ],
          filteredValue: tableParams?.filters?.[key] || null,
         filterSearch: true,
          onFilter: (value, record) => record[key] === value,
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

          // onCell: (record, rowIndex) => ({
          //   onDoubleClick: () => {
          //   onDoubleClick: () => {
          //     console.log("currentpage", currentPage, pageSize, rowIndex);
          //     const absoluteRowIndex = (currentPage - 1) * pageSize + rowIndex;
          //     handleCellDoubleClick(record, absoluteRowIndex, key);
          //   },
          // }),

          
          onCell: (record) => ({
            onDoubleClick: () => {
              // console.log("currentpage", currentPage, pageSize, rowIndex);
              // const absoluteRowIndex = (currentPage - 1) * pageSize + rowIndex;
              handleCellDoubleClick(record, null, key);
            },
          }),
          render:
            key === "thumbnail"
              ? (text, record) => {
                  const isImagePath = text.match(/\.(jpeg|jpg|gif|png)$/i);
                  // console.log("thumbnailname", text);
                  // console.log("image", isImagePath);
                  return isImagePath ? (
                    <img
                      src={`/assets/Thumbnails/${text}`}
                      alt={record.shot}
                      onError={(e) => (e.target.style.display = "none")}
                      style={{
                        width: "100px",
                        height: "auto",
                        maxWidth: "100%",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "auto",
                        wordWrap: "break-word",
                        whiteSpace: "normal",
                        padding: "10px",
                        border: "1px solid #ccc",
                      }}
                    >
                      {text}
                    </div>
                  );
                }
              : undefined,
        }));

     
      // setColumns([...fetchedColumns]);
      console.log("🧠 Columns updated:", fetchedColumns);
      setColumns(fetchedColumns);
       // const serialNumberColumn = {
      //   title: "S.No",
      //   key: "sno",
      //   render: (text, record, index) => {
      //     return (currentPage - 1) * pageSize + index + 1;
      //   },
      // };

      // setColumns([serialNumberColumn, ...fetchedColumns]);
      
    }
  };

  const fetchLockStatusData = async (project) => {
    try {
      console.log("Fetching lock status data...");

      // Make the HTTP request using axios
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
      console.log("datadata", data[0]);
      // setAuthorizedDepartments(data[0].departments);
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Unexpected data format or empty data array.");
      }

      console.log("data[0].lock:", data[0].lock, "Type:", typeof data[0].lock);

      return data[0].lock;
    } catch (error) {
      console.error("Error fetching lock status data:", error);
      return null;
    }
  };

  const fetchProjDepts = async (project) => {
    console.log("project",project)
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

      console.log("working_____data",data)
      // console.log("params",params)
      // console.log("responseeeeeeeeee", data)
      // setAuthorizedDepartments(data[0].departments);
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Unexpected data format or empty data array.");
      }
      console.log("projdatas", data[0].departments);
      return eval(data[0].departments);
    } catch (error) {
      console.error("Error fetching project departments data:", error);
      return null;
    }
  };

  const fetchData = () => {
    if (selectedProject) {
      setLoading(true);
      axios
        .get(
          `http://${ip_port}/all_bid_data/?proj=${selectedProject}`,
          {
            params: {
              page: currentPage,
              // pageSize: pageSize,
            },
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          const fetchedData = response.data;
          console.log("fetchedData", fetchedData);
          setData(fetchedData);
          localStorage.setItem("biddingData", JSON.stringify(fetchedData)); 
          setLoading(false);


        //   if (
        //     showTable &&
        //     selectedProject &&
        //     selectedMicroOption &&
            
        //     fetchedData.length > 0
        //   ) {
        //     updateColumns(); // ✅ ensures table has headers to render data
        //   }
        //   // updateColumns(fetchedData);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          if (error.response) {
            message.error(`${JSON.stringify(error.response.data)}`);
          }
          setLoading(false);
        });
    }
  };

  const handleMenuClick1 = async (e) => {
    if (e.key === "select") {
      resetToInitialState();
      return;
    }

    setSelectedProject(e.key);
    localStorage.setItem("biddingSelectedProject", e.key);

    setSelectedMicroOption("select");
    localStorage.setItem("biddingSelectedMicroOption", "select");

    setShowTable(false);
    localStorage.setItem("biddingShowTable", false)
    setData([]);
    setColumns([]);
    setEditingCell(null);

    const projDepts = await fetchProjDepts(e.key);
    console.log("projDepts", eval(projDepts));
    setAuthorizedDepartments(projDepts);

    setCurrentPage(1);
  };

  const resetToInitialState = () => {
    console.log("🧹 resetToInitialState called");
    setSelectedProject("select");
    localStorage.setItem("biddingSelectedProject", "select");

    setSelectedMicroOption("select");
    localStorage.setItem("biddingSelectedMicroOption", "select");

    setShowTable(false);
    localStorage.setItem("biddingShowTable", false);
    setData([]);
    setColumns([]);
    setAuthorizedDepartments([]);
  };

  const handleMenuClick2 = (e) => {
    setSelectedMicroOption(e.key);
    localStorage.setItem("biddingSelectedMicroOption", e.key);

    // updateColumns();
    setShowTable(false);
    localStorage.setItem("biddingShowTable", false);
  
    setData([]);
    setColumns([]); 
  };


  const handleButtonClick = () => {
    localStorage.setItem("biddingShowTable", true);
    setShowTable(true);
    
    console.log("Table columns:", columns);
    console.log("Table data:", data);
    localStorage.setItem("biddingShowTable", true);
    // if (data.length === 0) {
    //   fetchData(tableParams);
    // } else {
    //   updateColumns(); 
    // }
    // if (data.length > 0) {
    //   updateColumns(); 
    // }
  
    if (data.length === 0) {
      fetchData(tableParams);
    }
  };

  // const adjustedRowIndex = (currentPage - 1) * pageSize + rowIndex;

  // const handleCellDoubleClick = async (record, absoluteRowIndex, columnKey) => {
  const handleCellDoubleClick = async (record, _, columnKey) => {

    const rowId = record._id;
    const rowIndex = data.findIndex((row) => row._id === rowId);
    
    if (rowIndex === -1) {
    console.error("Row not found for _id:", rowId);
    message.error("Row data not found.");
    return;
    }

    // console.log("currentrowIndex", absoluteRowIndex);

    console.log(
      "record",
      record,
      
      "columnKey",
      columnKey
    );
    console.log("doubleclick");
    const editableColumns = filteredData[0].bid_le_columns || [];

    const microEditableColumns = filteredData[0].bid_days_columns || [];

    const complexityEditableColumns = filteredData[0].bid_cmplx_columns || [];

    const lockStatus = await fetchLockStatusData(selectedProject);
    console.log("lockStatus", lockStatus, typeof lockStatus);
    // console.log("lockstatus[0]", lockStatus[0])
    // setIsLocked(lockStatus[0]);
    setIsLocked(lockStatus);

    console.log("islocked", islocked, typeof islocked, lockStatus[1]);

    // if (!lockStatus[0]) {
    if (!lockStatus) {
      console.log("not locked");

      if (editableColumns.includes(columnKey)) {
        // showInputModal(record, absoluteRowIndex, columnKey, false);
        showInputModal(record, rowIndex, columnKey, false);
      } else if (microEditableColumns.includes(columnKey)) {
        // showInputModal(record, absoluteRowIndex, columnKey, true);
        showInputModal(record, rowIndex, columnKey, true);
      } else if (complexityEditableColumns.includes(columnKey)) {
        // showRadioInputModal(record, absoluteRowIndex, columnKey);
        showRadioInputModal(record, rowIndex, columnKey);
      } else if (columnKey === "thumbnail") {
        // showThumbnailModal(record, absoluteRowIndex, columnKey);
        showThumbnailModal(record, rowIndex, columnKey);
      } else if (columnKey === "exr") {
        // showExrModal(record, absoluteRowIndex, columnKey); 
        showExrModal(record, rowIndex, columnKey);
      } else if (columnKey === "status") {
        // showStatusRadioInputModal(record, absoluteRowIndex, columnKey);
        showStatusRadioInputModal(record, rowIndex, columnKey);
      } else {
        alert("This column is not editable.");
        return;
      }
    } else {
      alert("this project is locked");
    }
  };

  const showInputModal = (record, rowIndex, columnKey, isMicroEditable) => {
    setEditingCell({ rowIndex, columnKey, isMicroEditable });
    setNewValue(record[columnKey]);
    console.log("newValue", newValue);
    setIsModalVisible(true);
  };

  const showRadioInputModal = (record, rowIndex, columnKey) => {
    setEditingCell({ rowIndex, columnKey });
    setRadioOptions(["L", "M", "H", "SH"]);
    setSelectedRadioValue(record[columnKey]);
    setIsRadioModalVisible(true);
  };

  const showStatusRadioInputModal = (record, rowIndex, columnKey) => {
    setEditingCell({ rowIndex, columnKey });
    setRadioOptions(["A", "I"]);
    setSelectedRadioValue(record[columnKey]);
    setIsRadioModalVisible(true);
  };

  const showThumbnailModal = (record, rowIndex, columnKey) => {
    setEditingCell({ rowIndex, columnKey });
    setThumbnailPath(record[columnKey] || "");
    setIsThumbnailModalVisible(true);
  };

  const showExrModal = (record, rowIndex, columnKey) => {
    setEditingCell({ rowIndex, columnKey });
    setExrPath(record[columnKey] || "");
    setExrModalVisible(true);
  };

  const handleInputChangeText = (event) => {
    setNewValue(event.target.value);
  };

  const handleInputChangeNumber = (value) => {
    setNewValue(value);
  };

  const handleThumbnailUpload = async () => {
    if (!thumbnailPath) {
      message.error("Please enter a valid thumbnail path.");
      return;
    }

    if (editingCell) {
      const updatedData = [...data];
      const shot_name = updatedData[editingCell.rowIndex].shot;
      const project_name = updatedData[editingCell.rowIndex].proj;
      console.log(
        "shot_name",
        shot_name,
        "project_name",
        project_name,
        "thumbnailPath",
        thumbnailPath
      );
      const columnKey = editingCell.columnKey;
      updatedData[editingCell.rowIndex][columnKey] = thumbnailPath;
      setData(updatedData);
      setEditingCell(null);
      setThumbnailPath("");
      setIsThumbnailModalVisible(false);
      console.log("thumbnailPath", thumbnailPath);
      await updateThumbnail(thumbnailPath, project_name, shot_name);
      fetchData();
    }
  };

  const updateThumbnail = async (image_path, project_name, shot_name) => {
    let parameters = {
      image_path: image_path,
      project_name: project_name,
      shot_name: shot_name,
    };

    try {
      const response = await axios.post(
        `http://${ip_port}/upload-image/`,
        {
          image_path: image_path,
          project_name: project_name,
          shot_name: shot_name,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        message.success("Data updated successfully");
      } else {
        message.error("Failed to update data");
      }
    } catch (error) {
      console.error("Error updating data:", error);
      message.error("Error updating data");
    }
  };

  const sanitizePath = (path) => {
    // Replace backward slashes with forward slashes
    let sanitizedPath = path.replace(/\\/g, "/");

    // Remove surrounding double quotes if they exist
    if (sanitizedPath.startsWith('"') && sanitizedPath.endsWith('"')) {
      sanitizedPath = sanitizedPath.slice(1, -1);
    }

    return sanitizedPath;
  };

  const handleExrUpload = async () => {
    if (!exrPath) {
      message.error("Please enter a valid exr path.");
      return;
    }

    const sanitizedPath = sanitizePath(exrPath);

    if (editingCell) {
      const updatedData = [...data];
      const rowId = updatedData[editingCell.rowIndex]._id;
      const columnKey = editingCell.columnKey;
      updatedData[editingCell.rowIndex][columnKey] = exrPath;
      setData(updatedData);
      setEditingCell(null);
      setExrPath("");
      setExrModalVisible(false);

      await updateExrPath(rowId, columnKey, exrPath);
    }
  };

  const updateExrPath = async (rowId, columnKey, newValue) => {
    try {
      const response = await axios.patch(
        `http://${ip_port}/bidding/${rowId}/`,
        {
          [columnKey]: newValue,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        message.success("Data updated successfully");
      } else {
        message.error("Failed to update data");
      }
    } catch (error) {
      console.error("Error updating data:", error);
      message.error("Error updating data");
    }
  };

  const updateDatabase = async (rowId, columnKey, newValue) => {
    try {
      const response = await axios.patch(
        `http://${ip_port}/bidding/${rowId}/`,

        {
          [columnKey]: newValue,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
       
        console.log("Data updated successfully:");
        // message.success("Data updated successfully");
       notification.success(
        {
          description:"Data updated successfully"
        }
      );

        fetchData();
      } else {
        message.error("Failed to update data");
      }
    } catch (error) {
      console.error("Error updating data:", error);
      message.error("Error updating data");
    }
  };

  const handleOk = () => {
    if (editingCell) {
      const updatedData = [...data];

      if (updatedData[editingCell.rowIndex]) {
        const rowId = updatedData[editingCell.rowIndex]._id;
        const columnKey = editingCell.columnKey;

        if (filteredData[0].bid_days_columns.includes(columnKey)) {
          if (columnKey.split("_").length > 1) {
            let daysfields = [];
            daysfields.push(...filteredData[0].bid_micro[selectedMicroOption]);
            let macro_field = selectedMicroOption.toLowerCase();
            const macro_days = updatedData[editingCell.rowIndex][macro_field];
            let micro_days = 0;
            for (let field of daysfields) {
              if (field !== columnKey) {
                micro_days += updatedData[editingCell.rowIndex][field];
              }
            }
            micro_days += newValue;
            console.log("micro_days", micro_days, "macro_days", macro_days)

            if (micro_days > macro_days) {
              console.log("Micro days should not exceed Macro days")
              // message.error("Micro days should not exceed macro days")
              notification.error({
                message: "Validation Error",
                description: "Micro days should not exceed macro days."
              });
            } else {
              updatedData[editingCell.rowIndex][columnKey] = newValue;
              setData(updatedData);
              setEditingCell(null);
              setNewValue("");
              setSelectedRadioValue("");
              setIsModalVisible(false);

              updateDatabase(rowId, columnKey, newValue);
            }
          } else {
            updatedData[editingCell.rowIndex][columnKey] = newValue;
            setData(updatedData);
            setEditingCell(null);
            setNewValue("");
            setSelectedRadioValue("");
            setIsModalVisible(false);

            updateDatabase(rowId, columnKey, newValue);
          }
        } else {
          updatedData[editingCell.rowIndex][columnKey] = newValue;
          setData(updatedData);
          setEditingCell(null);
          setNewValue("");
          setSelectedRadioValue("");
          setIsModalVisible(false);

          updateDatabase(rowId, columnKey, newValue);
        }
      } else {
        // Handle the case where the row doesn't exist
        console.error("Row data not found for rowIndex:", editingCell.rowIndex);
        message.error("Unable to update the data. Row not found.");
      }
    }
  };

  const handleRadioOk = async () => {
    if (editingCell) {
      const updatedData = [...data];
      const rowId = updatedData[editingCell.rowIndex]._id;
      console.log("rowId", rowId);
      const columnKey = editingCell.columnKey;

      updatedData[editingCell.rowIndex][columnKey] = selectedRadioValue;
      setData(updatedData);
      setEditingCell(null);
      setSelectedRadioValue("");
      setIsRadioModalVisible(false);

      await updateDatabase(rowId, columnKey, selectedRadioValue);
    }
  };

  const handleRadioCancel = () => {
    setEditingCell(null);
    setSelectedRadioValue("");
    setIsRadioModalVisible(false);
  };

  const handleCancel = () => {
    setEditingCell(null);
    setNewValue("");
    setIsModalVisible(false);
  };

  const handleTableChange = (pagination,filters,sorter) => {
    // const sanitizedFilters = Object.fromEntries(
    //   Object.entries(filters).filter(([_, value]) => value != null)
    // );

    console.log("pagination", pagination);
    console.log("pagination", currentPage);
    setCurrentPage(pagination.current);

 

    // if (
    //   JSON.stringify(filters) === '{}' ||
    //   Object.values(filters).every((val) => val == null)
    // ) {
    //   return; 
    // }
    const newState = {
      pagination,
      filters,
      // sorter: sorter.columnKey ? sorter : {},
      sorter: sorter.columnKey ? sorter : {},
    };
    setTableParams(newState);
    localStorage.setItem("bidding_tableParams", JSON.stringify(newState));


   
    console.log("pagination", currentPage);
    fetchData();
  };



  const handleOpenFileDialog = (exrPath) => {
    const sanitizedPath = sanitizePath(exrPath);
    const url = `ParrotProtocol://${sanitizedPath}@@@`;

    window.location.href = url;
  };

  const showSendBiddingDataModal = (created, rejected, rejectedData) => {
    setCreatedCount(created);
    setRejectedCount(rejected);
    setRejectedObjects(rejectedData);
    setIsBidDataModalVisible(true);
  };

  const sendBiddingData = async (jsonData) => {
    const url = `http://${ip_port}/bid_bulk_create/`;

    // Prepare the payload
    const payload = {
      biddings: jsonData,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const responseData = await response.json();

        showSendBiddingDataModal(
          responseData.created_count,
          responseData.rejected_count,
          responseData.rejected_objects
        );
      } else {
        const errorData = await response.json();
        console.error(`Failed to send data. Status code: ${response.status}`);
        console.error("Response:", errorData);
      }
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  const handleBiddingFileUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        // Assuming the first sheet is the one we want to work with
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

        // Get the headers from the first row of the sheet
        const headers = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })[0];
        console.log("headers", headers);
        console.log("expheaders", EXPECTED_HEADERS);
     
        const headersMatch =
          JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);

        if (headersMatch) {
          // Print the data to the console if headers match
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          console.log("Bidding Data:", jsonData);

          sendBiddingData(jsonData);
        } else {
          // Show an error message if headers do not match
          // console.log("file do not match the expected headers.")
          // message.error(
          //   "The headers in the selected file do not match the expected headers."
          // );
           notification.error({
           description: "The headers in the selected file do not match the expected headers."
        });
          // console.log("file do not match the expected headers after msg.")
        }
      };

      reader.readAsArrayBuffer(file);
    }
  };

  const handleAddBiddingButtonClick = () => {
    resetBiddingModalState();
    fileInputRef.current.value = null;
    fileInputRef.current.click();
  };

  const showSendThumbnailDataModal = (created, rejected, rejectedData) => {
    setCreatedThumbnailCount(created);
    setRejectedThumbnailCount(rejected);
    setRejectedThumbnailObjects(rejectedData);
    setIsThumbnailDataModalVisible(true);
  };

  const sendThumbnailData = async (jsonData) => {
    const url = `http://${ip_port}/upload_bulk_images/`;

    // Prepare the payload
    const payload = {
      biddings: jsonData,
    };
    console.log("Payload being sent:", payload);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("Data sent successfully!");
        console.log("Response:", responseData);

        showSendThumbnailDataModal(
          responseData.created_count,
          responseData.rejected_count,
          responseData.rejected_objects
        );
      } else {
        const errorData = await response.json();
        console.error(`Failed to send data. Status code: ${response.status}`);
        console.error("Response:", errorData);
      }
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  const handleThumbNailFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const headers = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })[0];

        const EXPECTED_HEADERS = [
          "proj",
          "reel",
          "priority",
          "scene",
          "shot",
          "type",
          "frames",
          "thumbnail",
          "exr",
          "sow",
        ];

        const headersMatch = EXPECTED_HEADERS.every(
          (header, index) => header === headers[index]
        );

        if (headersMatch) {
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          // Filter relevant columns (shot, thumbnail, proj)
          // const filteredData = jsonData.map((row) => ({
          //   proj: row.proj,
          //   shot: row.shot,

          //   thumbnail: row.thumbnail,
          // }));
          sendThumbnailData(jsonData);
          console.log("Filtered thumbnail  Data:", jsonData);
        } else {
          message.error(
            "The headers in the selected file do not match the expected headers."
          );
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleThumbNailButtonClick = () => {
    // document.getElementById("fileInput").click();
    // fileInputRefThumbnail.current.click();
    resetThumbnailModalState();
    fileInputRefThumbnail.current.value = null;
    if (fileInputRefThumbnail.current) {
      fileInputRefThumbnail.current.click();
    } else {
      console.error("File input ref is not attached properly.");
    }
  };

  const handleExcelExport = () => {
    if (data.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(data);

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      XLSX.writeFile(workbook, `Project_${selectedProject}_Data.xlsx`);
    } else {
      console.log("No data available to export.");
    }
  };

  const showSendMandaysDataModal = (
    updated_count,
    rejected_count,
    rejected_objects
  ) => {
    setUpdatedObjectsMandaysCount(updated_count);
    // setNotUpdatedMandaysObjects(rejected_count);
    setNotUpdatedMandaysObjects(rejected_objects);
    setIsMandaysDataModalVisible(true);
  };

  const sendMandaysData = async (jsonData) => {
    const url = `http://${ip_port}/update_mandays/`;

    const payload = {
      data_list: jsonData,
    };
    console.log("Payload being sent:", payload);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("Data sent successfully!");
        console.log("Response:", responseData);

        showSendMandaysDataModal(
          responseData.updated_count,
          responseData.rejected_count,
          responseData.rejected_objects
        );
      } else {
        const errorData = await response.json();
        console.error(`Failed to send data. Status code: ${response.status}`);
        console.error("Response:", errorData);
      }
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  const handleAddMandaysButtonClick = () => {
    resetMandaysModalState();
    fileInputRefMandays.current.value = null;
    if (fileInputRefMandays.current) {
      fileInputRefMandays.current.click();
    } else {
      console.error("File input ref is not attached properly.");
    }
  };

  const handleAddMandaysFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
        const EXPECTED_MANDAYS_HEADERS = [
          "proj",
          "shot",
          "frames",
          "mm",
          "anim",
          "fx",
          "lit",
          "roto",
          "dmp",
          "paint",
          "mgfx",
          "unreal",
          "comp",
        ];
        const headersMatch = EXPECTED_MANDAYS_HEADERS.every(
          (header, index) => header === headers[index]
        );

        if (headersMatch) {
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          sendMandaysData(jsonData);
        } else {
          message.error(
            "The headers in the selected Mandays file do not match the expected headers."
          );
        }
      };

      reader.readAsArrayBuffer(selectedFile);
    }
  };
  const filteredOptions = options1.filter((option) =>
    option.toLowerCase().includes(searchText.toLowerCase())
  );
  const menu1 = (
    
    <div>
      
      <Input
        placeholder="Search project"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: "8px" ,width:"140px"}}
      />
    <Menu
      onClick={handleMenuClick1}
      style={{
       width: "140px", 
        maxHeight: "200px",
        overflowY: "auto",
      }}
    >
      {/* {options1.map((proj) => ( */}
      {filteredOptions.map((proj) => (
        <Menu.Item key={proj}>{proj}</Menu.Item>
      ))}
    </Menu>
    </div>
  );
  

  const menu2 = (
    <Menu
      onClick={handleMenuClick2}
      style={{
        maxHeight: "200px", // Set maximum height for the dropdown
        overflowY: "auto", // Enable vertical scrolling
      }}
    >
      <Menu.Item key="select">select</Menu.Item>
      {options2.map((header) => (
        <Menu.Item key={header}>{header}</Menu.Item>
      ))}
    </Menu>
  );

  const resetBiddingModalState = () => {
    setCreatedCount(0);
    setRejectedCount(0);
    setIsBidDataModalVisible(false);
    setTimeout(() => {
      setCreatedCount(0);
      setRejectedCount(0);
      setRejectedObjects([]);
    }, 200);
  };

  const resetThumbnailModalState = () => {
    setCreatedThumbnailCount(0);
    setRejectedThumbnailCount(0);
    setIsThumbnailDataModalVisible(false);
    setTimeout(() => {
      setCreatedThumbnailCount(0);
      setRejectedThumbnailCount(0);
    }, 200);
  };

  const resetMandaysModalState = () => {
    setUpdatedObjectsMandaysCount(0);
    setNotUpdatedMandaysObjects(0);

    setIsMandaysDataModalVisible(false);
    setTimeout(() => {
      setUpdatedObjectsMandaysCount(0);
      setNotUpdatedMandaysObjects(0);
    }, 200);
  };
  const exportRejectedToExcel = () => {
    const modifiedRejectedObjects = rejectedObjects.map((item) => ({
      ...item,
      error:
        typeof item.error === "object"
          ? JSON.stringify(item.error)
          : String(item.error),
    }));
    const worksheet = XLSX.utils.json_to_sheet(modifiedRejectedObjects);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rejected Data");
    XLSX.writeFile(workbook, "rejected_biddings.xlsx");
  };

  const exportRejectedThumbnailToExcel = () => {
    const modifiedRejectedObjects = rejectedThumbnailObjects.map((item) => ({
      ...item,
      error:
        typeof item.error === "object"
          ? JSON.stringify(item.error)
          : String(item.error), // Convert the "error" field to a string
    }));
    const worksheet = XLSX.utils.json_to_sheet(modifiedRejectedObjects);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rejected Data");
    XLSX.writeFile(workbook, "rejected_thumbnails.xlsx");
  };

  const exportRejectedMandaysToExcel = () => {
    console.log("notUpdatedMandaysObjects", notUpdatedMandaysObjects);
    const modifiedRejectedObjects = notUpdatedMandaysObjects.map((item) => ({
      ...item,
      error:
        typeof item.error === "object"
          ? JSON.stringify(item.error)
          : String(item.error), 
    }));
    const worksheet = XLSX.utils.json_to_sheet(modifiedRejectedObjects);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rejected Data");
    XLSX.writeFile(workbook, "rejected_mandays.xlsx");
  };
  return (
    <div className="bidding-container">
      <div style={{ textAlign: "center", marginTop: "0px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div style={{ marginLeft: "20px" }}>
            <label
              htmlFor="option-dropdown1"
              style={{
                marginRight: "5px",
                // height: "25px",
                // width: "10px",
                textAlign: "center",
                borderRadius: "5px",
              }}
            >
              Project:
            </label>
            <Dropdown overlay={menu1} trigger={["click"]}>
              <Button style={{width: "140px"}} id="option-dropdown1">
                {selectedProject || "Select an option"}
              </Button>
            </Dropdown>
          </div>

          <div style={{ marginLeft: "20px" }}>
            <label htmlFor="option-dropdown2" style={{ marginRight: "10px" }}>
              Micro Option:
            </label>
            <Dropdown overlay={menu2} trigger={["click"]}>
              <Button  style={{width:"130px"}}id="option-dropdown2">
                {selectedMicroOption || "Select an option"}
              </Button>
            </Dropdown>
          </div>

          <Button
          type="primary"
          onClick={handleButtonClick}
          disabled={!selectedProject}
          style={{ marginTop: "0px" }}
        >
          Show Table
        </Button>

          <div
            style={{
              display: "flex",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            {designation === "Manager" && (
              <>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  style={{ display: "none" }}
                  ref={fileInputRef}
                  onChange={handleBiddingFileUpload}
                />
                <Button
                  type="default"
                  style={{ marginLeft: "30px" }}
                  onClick={handleAddBiddingButtonClick}
                >
                  AddBiddingData
                </Button>

                <>
                  <Button
                    type="default"
                    style={{ marginLeft: "20px" }}
                    onClick={handleAddMandaysButtonClick}
                  >
                    Add Mandays
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRefMandays}
                    style={{ display: "none" }}
                    onChange={handleAddMandaysFileChange}
                  />
                </>

                <div>
                  <Button
                    type="default"
                    style={{ marginLeft: "20px" }}
                    onClick={handleThumbNailButtonClick}
                  >
                    Add Thumbnails
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRefThumbnail}
                    style={{ display: "none" }}
                    onChange={handleThumbNailFileUpload}
                  />
                </div>

                <Button
                  type="default"
                  style={{ marginLeft: "20px" }}
                  onClick={handleExcelExport}
                  disabled={data.length === 0}
                >
                  Excel Export
                </Button>
              </>
            )}
          </div>
        </div>

       {/* {isReady.current && columns.length > 0 && data.length > 0 && ( */}

        {/* {showTable && selectedProject && (
       
          <Spin spinning={loading}>
           
              {(data.length === 0 || columns.length === 0) ? (
              <Alert
                message="No Data"
                description={`No data available for ${selectedProject}.`}
                type="info"
                showIcon
                style={{ marginTop: "60px", border: "2px solid #ccc" }}
              />
            ) : (
              
              <div className="scrollable-table-wrapper">
                  {console.log("✅ Rendering table with data:", data.length, "columns:", columns.length)}
              <Table
                className="custom-table"
                columns={columns}
                dataSource={data}
                onChange={handleTableChange}
               
                pagination={false}
               
                scroll={{ x: 'max-content', y: 'calc(100vh - 340px)' }}
               
                sticky={{ offsetHeader: 0 }}
                style={{ marginTop: "10px", border: "2px solid #ccc" }}
                bordered
              />
              </div>
            )}
          </Spin>
        )} */}




{showTable && selectedProject && (
  <Spin spinning={loading}>
    {/* {(data.length > 0 && columns.length > 0) ? ( */}
    {data && Array.isArray(data) && data.length > 0 && columns.length > 0 ? (
      <div className="scrollable-table-wrapper">
        {console.log("✅ Rendering table with data:", data.length, "columns:", columns.length)}
        <Table
          // rowKey={(record) => record._id || record.key || record.id || record.shot}
          rowKey={(record) => record._id}
          key={selectedProject} 
          className="custom-table"
          columns={columns}
          dataSource={data}
          onChange={handleTableChange}
          pagination={false}
          scroll={{ x: 'max-content', y: 'calc(100vh - 340px)' }}
          sticky={{ offsetHeader: 0 }}
          style={{ marginTop: "10px", border: "2px solid #ccc" }}
          bordered
        />
      </div>
    ) : !loading && (
      <Alert
        message="No Data"
        description={`No data available for ${selectedProject}.`}
        type="info"
        showIcon
        style={{ marginTop: "60px", border: "2px solid #ccc" }}
      />
    )}
  </Spin>
)}



        <Modal
          title="Edit Cell"
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          {editingCell &&
            (editingCell.isMicroEditable ? (
              <InputNumber
                value={newValue}
                onChange={handleInputChangeNumber}
                placeholder={
                  editingCell ? `Edit ${editingCell.columnKey}` : "Enter value"
                }
                step={0.5}
                min={0}
              />
            ) : (
              <Input
                value={newValue}
                onChange={handleInputChangeText}
                placeholder={
                  editingCell ? `Edit ${editingCell.columnKey}` : "Enter value"
                }
              />
            ))}
        </Modal>

        <Modal
          title={`Edit ${editingCell ? editingCell.columnKey : ""}`}
          visible={isRadioModalVisible}
          onOk={handleRadioOk}
          onCancel={handleRadioCancel}
        >
          <Radio.Group
            onChange={(e) => setSelectedRadioValue(e.target.value)}
            value={selectedRadioValue}
          >
            {radioOptions.map((option, index) => (
              <Radio key={index} value={option}>
                {option}
              </Radio>
            ))}
          </Radio.Group>
        </Modal>

        <Modal
          title="Edit Thumbnail Path"
          visible={isThumbnailModalVisible}
          onOk={handleThumbnailUpload}
          onCancel={() => setIsThumbnailModalVisible(false)}
        >
          <Input
            value={thumbnailPath}
            onChange={(e) => setThumbnailPath(e.target.value)}
          />
        </Modal>

        <Modal
          title="Edit Exr Path"
          visible={exrModalVisible}
          onOk={handleExrUpload}
          onCancel={(e) => setExrModalVisible(false)}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              flexDirection: "column",
            }}
          >
            <Button
              type="primary"
              onClick={() => handleOpenFileDialog(exrPath)}
              style={{ height: "36px", width: "126px", marginBottom: "10px" }}
            >
              Open
            </Button>
            <Input
              value={exrPath}
              onChange={(e) => setExrPath(e.target.value)}
            />
            <Button
              type="primary"
              onClick={handleExrUpload}
              style={{ height: "36px", width: "126px", marginTop: "10px" }}
            >
              Update
            </Button>
          </div>
        </Modal>

        <Modal
          title="Bidding Data Result"
          visible={isBidDataModalVisible}
          onOk={resetBiddingModalState}
          onCancel={resetBiddingModalState}
          footer={[
            <Button key="close" onClick={resetBiddingModalState}>
              Close
            </Button>,
            <Button
              key="export"
              onClick={exportRejectedToExcel}
              disabled={rejectedCount === 0}
            >
              Rejected Data
            </Button>,
          ]}
        >
          <p>Created Count: {createdCount}</p>
          <p>Rejected Count: {rejectedCount}</p>
        </Modal>

        <Modal
          title="Thumbnail Data Result"
          visible={isThumbnailDataModalVisible}
          onOk={resetThumbnailModalState}
          onCancel={resetThumbnailModalState}
          footer={[
            <Button key="close" onClick={resetThumbnailModalState}>
              Close
            </Button>,
            <Button
              key="export"
              onClick={exportRejectedThumbnailToExcel}
              disabled={rejectedThumbnailObjects === 0}
            >
              Rejected Data
            </Button>,
          ]}
        >
          <p>Created Thumbnail Count: {createdThumbnailCount}</p>
          <p>Rejected Thumbnail Count: {rejectedThumbnailCount}</p>
        </Modal>

        <Modal
          title="Mandays Data Summary"
          visible={isMandaysDataModalVisible}
          onOk={resetMandaysModalState}
          onCancel={resetMandaysModalState}
          footer={[
            <Button key="close" onClick={resetMandaysModalState}>
              Close
            </Button>,
            <Button
              key="export"
              onClick={exportRejectedMandaysToExcel}
              disabled={notUpdatedMandaysObjects.length === 0}
            >
              Rejected Data
            </Button>,
          ]}
        >
          <p>Updated Count: {updatedObjectsMandaysCount}</p>
          <p>Rejected Count: {notUpdatedMandaysObjects.length}</p>
        </Modal>
      </div>
    </div>
  );
};

export default Bidding;
