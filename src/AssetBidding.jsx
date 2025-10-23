import React, { useState, useEffect,useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { useAuth } from "./AuthContext";
import { ip_port } from "./Configs";
import { fetchProjectList } from "./utils";
import "./AssetBidding.css";
import {handleCellClick} from "./shotsAssignedCellColor";
import { getAssetHighlightedStyle } from "./shotsAssignedCellColor";
import {handleAssignAssetTask} from "./shotsHandleAssignTask"
// import { getGlobalShotsData } from "./globalShotsState";

// import { loadShotsData, getShotsData } from "./utils";
import {Menu, Dropdown,Button,Table,Spin,Alert,Input,Modal,message,InputNumber,Radio,notification} from "antd";

const AssetBidding = () => {
  const { userControls, filteredData, accessToken, designation,user } = useAuth();
  console.log("userControls", userControls)
  const loadShotsData = async () => {
    try {
      // const config = await fetch("/config.json").then(res => res.json());
  
      // if (!config.shotsDataURL) {
      //   throw new Error("shotsDataURL missing in config.json");
      // }
  
      const response = await axios.get("http://192.168.80.193:8888/users_data/");
      const data =  response.data;
  
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
  
  const DEFAULT_DEPARTMENT = "asset";

  const [globalShotsObject, setGlobalShotsObject] = useState(getShotsData());

  const [selectedAssetBidProject, setSelectedAssetBidProject] = useState("");
  const [selectedMicroOption, setSelectedMicroOption] = useState("");
  const [projectList, setProjectList] = useState([]);
  const [assetFieldsDropdown, setAssetFieldsDropdown] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAssetField, setSelectedAssetField] = useState("Select a field");
  const [AssetBidTableData, setAssetBidTableData] = useState([]);
  const [AssetBidTableColumns, setAssetBidTableColumns] = useState([]);
  const [isAssetDataModalVisible, setIsAssetDataModalVisible] = useState(false);
  const [successAssetCount, setSuccessAssetCount] = useState(0);
  const [rejectedAssetCount, setRejectedAssetCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rejectedAssetObjects, setRejectedAssetObjects] = useState([]);
  const [isAssetArtistModalVisible, setIsAssetArtistModalVisible] = useState(false);
  const [selectedAssetArtist, setSelectedAssetArtist] = useState(null);
  const [assetsTextAreaColumns, setAssetTextAreaColumns] = useState([]);
  const [selectedAssetRow, setSelectedAssetRow] = useState([]);
  const [assetMandaysTableData, setAssetMandaysTableData] = useState([]);
  const [assetMandaysTableColumns, setAssetMandaysTableColumns] = useState([]);
  
  const hasShownAssetFetchError = useRef(false);


  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 100 },
    filters: {},
    sorter: {},
  });

  // const [assetTextareaValue, setAssetTextareaValue] = useState("");
  // const hasUpdatedShotsColumns = useRef(false);
  const [assetPersistedText, setAssetPersistedText] = useState("");
  // const [selectedAssetDepartment, setSelectedDepartment] = useState(""); 
  const [showAssetTable, setAssetShowTable] = useState(
    JSON.parse(localStorage.getItem("assetsShowTable")) || false
  );
  const { TextArea } = Input;
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); 
  const projectRef = useRef("");
  const fileInputRef = useRef(null);
  const [searchText, setSearchText] = useState("");
  
 




  const filteredAssetRowData = selectedAssetRow.map((row) =>
    Object.fromEntries(
      Object.entries(row).filter(([key]) => assetsTextAreaColumns.includes(key))
    )
  );


  const maxKeyLength = Math.max(
    ...assetsTextAreaColumns.map((col) => col.length)
  );
  useEffect(() => {
    const savedParams = localStorage.getItem("assetBidding_tableParams");
    if (savedParams) {
      const parsedParams = JSON.parse(savedParams);
      setTableParams(parsedParams);
      setCurrentPage(parsedParams.pagination?.current || 1);
      setPageSize(parsedParams.pagination?.pageSize || 10);
    
    }
  }, []);
  

  useEffect(() => {
    if (AssetBidTableData.length > 0 && selectedAssetBidProject) {
      const updatedColumns = Object.keys(AssetBidTableData[0])
        .filter((key) => key !== "_id" && key !== "assigned_to")
        .map((key, index) => ({
          title: key,
          dataIndex: key,
          key: key,
          width: calculateColumnWidth(key, AssetBidTableData),
          ellipsis: true,
          fixed: index < 3 ? "left" : false,
          filters: [...new Set(AssetBidTableData.map((item) => item[key]))].map(
            (value) => ({
              text: value,
              value: value,
            })
          ),
          filteredValue: tableParams?.filters?.[key] ?? null,
          filterSearch: true,
          onFilter: (value, record) => record[key] === value,
          sorter: (a, b) => {
            if (typeof a[key] === "number") return a[key] - b[key];
            if (typeof a[key] === "string") return a[key].localeCompare(b[key]);
            return 0;
          },
          sortOrder:
            tableParams?.sorter?.field === key
              ? tableParams?.sorter?.order
              : null,
          sortDirections: ["descend", "ascend"],
          onCell: (record, rowIndex) => ({
            style: getAssetHighlightedStyle(record, key),
            onDoubleClick: () => {
              const absoluteRowIndex =
                (currentPage - 1) * pageSize + rowIndex;
              handleCellAssetBidDoubleClick(record, absoluteRowIndex, key);
            },
          }),
        }));
  
      setAssetBidTableColumns(updatedColumns);
    }
  }, [AssetBidTableData, selectedAssetBidProject, tableParams]);
  
  


  useEffect(() => {
    console.log("before getting users")
    const fetchShots = async () => {
      const data = await loadShotsData();
      setGlobalShotsObject(data); 
    };
    fetchShots();
    console.log("after getting users")
  }, []);


  useEffect(() => {
    if (selectedAssetRow.length && DEFAULT_DEPARTMENT && assetsTextAreaColumns.length > 0) {
      const formatted = filteredAssetRowData
        .map((row) =>
          assetsTextAreaColumns
            .map((col) => {
              const value = String(row[col] ?? "_").trim();
  
              const label = `${col}:`.padEnd(maxKeyLength + 2, " ");
              return `${label}${value}`;
            })
            .join("\n")
        )
        .join("\n\n");
  
      setAssetPersistedText(formatted);
    }
  }, [selectedAssetRow, DEFAULT_DEPARTMENT, assetsTextAreaColumns]);

  const EXPECTED_ASSET_HEADERS = [
    "proj",
    "priority",
    "sow",
    "asset_name",
    "thumbnail",
    "inputs",
    "mandays",
    
    
  ];
  useEffect(() => {
    fetchProjectList(accessToken)
      .then((data) => {
        setProjectList(data);
        // setSelectedAssetBidProject("select");

        const savedProject = localStorage.getItem("userselectedAssetBidProject");
        setSelectedAssetBidProject(savedProject || "select");

        const savedMicroOption = localStorage.getItem("selectedMicroOption");
        setSelectedMicroOption(savedMicroOption || "");
      })
      .catch((err) => {
        console.error("Error fetching projects:", err);
      });
  }, []);



  
  useEffect(() => {
    const fetchAggregateMandays = async () => {
      if (
        isAssetArtistModalVisible &&
        selectedAssetBidProject !== "select" &&
        selectedAssetRow.length > 0
      ) {
        const assetName = selectedAssetRow[0]?.asset_name;
        const params = new URLSearchParams();
        params.append("asset_name", assetName);
  
        assetFieldsDropdown.forEach((field) => {
          params.append("fields", field);
        });
  
        try {
          const response = await fetch(
            `http://${ip_port}/assets_aggregate_mandays/?${params.toString()}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );
  
          if (!response.ok) throw new Error(`Error ${response.status}`);
  
          const data = await response.json();
          setAssetMandaysTableData([data]); // wrap in array for Table
  
          const columns = Object.keys(data).map((key) => ({
            title: key,
            dataIndex: key,
            key,
            // width:150,
            ellipsis: true,
          }));
          setAssetMandaysTableColumns(columns);
        } catch (err) {
          console.error("Failed to fetch asset aggregate mandays:", err);
        }
      }
    };
  
    fetchAggregateMandays();
  }, [isAssetArtistModalVisible]);
  


  useEffect(() => {
    if (selectedAssetBidProject && selectedAssetBidProject !== "select") {
      localStorage.setItem("userselectedAssetBidProject", selectedAssetBidProject);
      projectRef.current = selectedAssetBidProject; 
    }
  }, [selectedAssetBidProject]);

  useEffect(() => {
    if (selectedMicroOption && selectedMicroOption !== "select") {
      localStorage.setItem("selectedMicroOption", selectedMicroOption);
    }
  }, [selectedMicroOption]);

  useEffect(() => {
    const storedData = localStorage.getItem("assetBiddingTableData");
    const storedColumns = localStorage.getItem("assetBiddingTableColumns");

    if (storedData && storedColumns&&!AssetBidTableData.length) {
      setAssetBidTableData(JSON.parse(storedData));
      setAssetBidTableColumns(JSON.parse(storedColumns));
      setAssetShowTable(true);
    }
  }, []);





  useEffect(() => {
    const savedProject = localStorage.getItem("userselectedAssetBidProject");
    const storedData = localStorage.getItem("assetBiddingTableData");
  
    if (savedProject) {
      setSelectedAssetBidProject(savedProject);
      if (storedData) {
        setAssetBidTableData(JSON.parse(storedData));
      } else {
        fetchAssetBidTableData(savedProject);
      }
    }
  }, []);
  

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     const g_data = getGlobalShotsData();
  //     if (g_data) {
  //       setGlobalShotsObject(g_data);
  //       console.log("g_data updated:", g_data);
  //       clearInterval(interval);
  //     }
  //   }, 500);

  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    if (!isAssetDataModalVisible) {
      setSuccessAssetCount(0);
      setRejectedAssetCount(0);
      setRejectedAssetObjects([]);
    }
  }, [isAssetDataModalVisible]);

  useEffect(() => {
    fetch("/config.json")
      .then((res) => res.json())
      .then((config) => {
        console.log("Loaded config:", config);
        setAssetFieldsDropdown(config.assetDDFields);
      });
  }, []);



  useEffect(() => {
    if (showAssetTable && selectedAssetBidProject) {
      fetchAssetBidTableData(selectedAssetBidProject);
    }
  }, [showAssetTable]);
  





  useEffect(() => {
    const saved = localStorage.getItem("assetTextareaValue");
    if (saved) setAssetPersistedText(saved);
  }, []);
  
  // Persist
  useEffect(() => {
    localStorage.setItem("assetTextareaValue", assetPersistedText);
  }, [assetPersistedText]);


  useEffect(() => {
    setAssetBidTableData([]);
    setAssetBidTableColumns([]);
    localStorage.removeItem("assetBiddingTableData");
    localStorage.removeItem("assetBiddingTableColumns");
   
  }, [selectedAssetBidProject]);
  





  
  const formatSelectedAssetRowForTable = (data) => {
    if (!data || data.length === 0) return { columns: [], dataSource: [] };
  
    const row = {};
    data.forEach(({ field, value }) => {
      row[field] = value;
    });
  
    const columns = Object.keys(row).map((key) => ({
      title: key,
      dataIndex: key,
      key,
      align: "center",
    }));
  
    return {
      columns,
      dataSource: [{ key: "single-row", ...row }],
    };
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
        style={{ marginBottom: "8px" , width:"140px"}}
      />
    <Menu
      onClick={(e) =>handleProjectChange(e.key)}
      style={{
        maxHeight: "200px",
        overflowY: "auto",
      }}
    >
      {filteredOptions.map((project) => (
        <Menu.Item key={project}>{project}</Menu.Item>
      ))}
    </Menu>
    </div>
  );

  const fetchLockStatusData = async (selectedAssetBidProject) => {
    console.log("projectt", selectedAssetBidProject)
    try {
      console.log("Fetching lock status data...");

     
      const response = await axios.get(`http://${ip_port}/projects/`, {
        params: {
          project_code: selectedAssetBidProject,
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

 
  const handleCellAssetBidDoubleClick = async (record, rowIndex, columnKey) => {

    const cellStyle = getAssetHighlightedStyle(record, columnKey);
    const isHighlighted = cellStyle && !!cellStyle.background;

   
    
    if (isHighlighted) {
      const columnName = columnKey
      const assetName = record.asset_name;
      try {
        const response = await fetch(
          `http://${ip_port}/assets_calc_artists/?asset_name=${assetName}&field=${columnName}`
        );
        if (!response.ok) throw new Error("Failed to fetch");
        const result = await response.json();
  
        Modal.info({
          title: `Details for "${assetName}" - "${columnName}"`,
          width: 600,
          content: (
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              <p><strong>Assigned to:</strong></p>
              <ul style={{ paddingLeft: "20px", marginTop: 0 }}>
                {result?.result?.map((name, index) => (
                  <li key={index}>{name}</li>
                ))}
              </ul>
              <p><strong>Total:</strong> {result?.total ?? "N/A"}</p>
            </div>
          ),
        });
      } catch (error) {
        console.error(error);
        // message.error("Error fetching data from API.");
        notification.error({
          description:"Error fetching data from API."
        });
      }
  
      return; 
    }

    const currentValue = record[columnKey];

    if (["asset_name", "proj"].includes(columnKey)) {
      return; 
    }
    
  
    if (["priority", "status"].includes(columnKey)) {
      // Show radio buttons for priority and status
      const radioOptions = columnKey === "priority" ? ["0", "1"] : ["A", "I"];
      let selectedValue = currentValue;
  
      Modal.confirm({
        title: `Edit ${columnKey}`,
        icon: null,
        content: (
          <Radio.Group
            defaultValue={selectedValue}
            onChange={(e) => {
              selectedValue = e.target.value;
            }}
          >
            {radioOptions.map((opt) => (
              <Radio key={opt} value={opt}>
                {opt}
              </Radio>
            ))}
          </Radio.Group>
        ),
        onOk: async () => {
          if (selectedValue === undefined || selectedValue === currentValue) return;
           console.log(  "columnkey","selectedValue", columnKey, selectedValue )

          try {

            const row_id = record._id;

            await axios.patch(
              `http://${ip_port}/assets/${row_id}/`,
              { [columnKey]: selectedValue },
              { headers: { Authorization: `Bearer ${accessToken}` } }
            );
  
          
          await fetchAssetBidTableData(projectRef.current);
            // message.success("Updated successfully");
            notification.success({
              description:"Updated successfully"
            });
          
           
          } catch (err) {
            console.error("Update failed:", err);
            // message.error("Failed to update. Try again.");
            notification.error({
             description: "Failed to update. Try again."
            });
          }
        },
      });
    } else if (
      ["modeling", "texturing", "rigging", "hair_and_fur", "mandays"].includes(
        columnKey
      )
    ) {
      // let floatValue = parseFloat(currentValue);
      let newSpinValue = parseFloat(currentValue);
      console.log("columnkeyyFloat", columnKey,"newSpinValue",newSpinValue)
  
      Modal.confirm({
        title: `Edit ${columnKey}`,
        icon: null,
        content: (
          <InputNumber
            id="update-spin"
            defaultValue={newSpinValue}
            onChange={(value) => {
              newSpinValue = value;
            }}
            step={0.1}
            min={0}
            style={{ width: "100%" }}
          />
        ),
        onOk: async () => {
          // const newValue = parseFloat(document.getElementById("update-spin").value);
          // if (isNaN(newValue) || newValue === floatValue) return;
         
         
          const newValue = parseFloat(newSpinValue);
          if (isNaN(newValue) || newValue === parseFloat(currentValue)) return;

          if (columnKey === "mandays") {
            const isLocked = await fetchLockStatusData(projectRef.current);
            if (isLocked === true) {
              // message.warning("Project is locked. Cannot update mandays.");
              notification.warning({
               description: "Project is locked. Cannot update mandays."
              });
              return;
            }
          }
  
          // Subtask sum check
          if (
            ["modeling", "texturing", "rigging", "hair_and_fur"].includes(
              columnKey
            )
          ) {
            const total = ["modeling", "texturing", "rigging", "hair_and_fur"]
              .map((key) =>
                key === columnKey ? newValue : parseFloat(record[key] || 0)
              )
              .reduce((a, b) => a + b, 0);
  
            if (total > parseFloat(record.mandays)) {
              // message.error("Sum of task days exceeds mandays.");
              notification.error({
                description:"Sum of task days exceeds mandays."
              });
              return;
            }
          }
  
          try {
            const row_id = record._id;
            await axios.patch(
              `http://${ip_port}/assets/${row_id}/`,
              { [columnKey]: newValue },
              { headers: { Authorization: `Bearer ${accessToken}` } }
            );
  
          
            await fetchAssetBidTableData(projectRef.current);
            // message.success("Updated successfully");
            notification.success({
              description:"Updated successfully"
            });
           

            
           
          } catch (err) {
            console.error("Update failed:", err);
            // message.error("Failed to update. Try again.");
            notification.error({
              description:"Failed to update. Try again."
            });
          }
        },
      });
    } else {
      // Default text input fallback
      let inputValue = currentValue;
     console.log("columnkeyInput",columnKey, "inputValue", inputValue)
      Modal.confirm({
        title: `Edit ${columnKey}`,
        content: (
          <Input defaultValue={inputValue}   onChange={(e) => {
            inputValue = e.target.value;
          }} id="update-input" type="text" />
        ),
        onOk: async () => {
               
          if (inputValue === undefined || inputValue === currentValue) return;
          try {
            const row_id = record._id;
            await axios.patch(
              `http://${ip_port}/assets/${row_id}/`,
              { [columnKey]: inputValue },
              { headers: { Authorization: `Bearer ${accessToken}` } }
            );
  
           
            await fetchAssetBidTableData(projectRef.current);
            // message.success("Updated successfully");
            notification.success({description:"Updated successfully"});
           
            
          } catch (err) {
            console.error("Update failed:", err);
            // message.error("Failed to update. Try again.");
            notification.error({description:"Failed to update. Try again."});
          }
        },
      });
    }
  };
  




  const assetsFieldsMenu=(
      <Menu onClick={(e) =>   setSelectedAssetField(e.key)}  style={{
          maxHeight: "200px",
          overflowY: "auto",
        }}>
        {assetFieldsDropdown.map((field) => (
          <Menu.Item key={field}>
            {field}
          </Menu.Item>
        ))}
      </Menu>

      )


      const calculateColumnWidth = (key, data) => {
        const padding = 40;
        const maxLength = Math.max(
          ...data.map((item) => (item[key] ? item[key].toString().length : 0)),
          key.length
        );
    
        let calculatedWidth = maxLength * 10 + padding;
    
        return Math.min(Math.max(120, calculatedWidth), 800);
      };

  const fetchAssetBidTableData = async (project) => {
    setLoading(true)
    try {
      const response = await axios.get(
        `http://${ip_port}/assets/?proj=${project}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = response.data;


      
      console.log("dataa", data);
      const customWidthMap = {
        thumbnail: 180,
        name: 200,
        status: 120,
      };
      // Dynamically create columns
      if (data.length > 0) {
      
        const columns = Object.keys(data[0])
            
          .filter((key) => key !== "_id" && key !== "assigned_to")
          .map((key, index) => ({
            
            title: key,
            dataIndex: key,
            key: key,
            width: calculateColumnWidth(key, data),
            // width: columnWidthMap[key] || 120,
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
            filteredValue: tableParams.filters?.[key] || null,
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
            sortOrder: tableParams.sorter?.field=== key ? tableParams.sorter.order : null,
                  
            sortDirections: ["descend", "ascend"],
           
            onCell: (record, rowIndex) => ({
              style: getAssetHighlightedStyle(record, key),
              onDoubleClick: () => {
                console.log("currentpage", currentPage, pageSize, rowIndex);

                const absoluteRowIndex =
                  (currentPage - 1) * pageSize + rowIndex;
                handleCellAssetBidDoubleClick(record, absoluteRowIndex, key);
              },
            }),
           

            // render: (text, record) => {
            //   if (key === "thumbnail") {
                
            //     // const isImagePath = text.match(/\.(jpeg|jpg|gif|png)$/i);
            //     // const isImagePath = (text ?? "").toString().match(/\.(jpeg|jpg|gif|png)$/i);
  
            //     const fileName = typeof text === "string" ? text.split(/\\|\//).pop() : "";
            //     const isImagePath = fileName.match(/\.(jpeg|jpg|gif|png)$/i);
               
            //     return isImagePath ? (
            //       <img
            //         // src={`/assets/Thumbnails/${text}`}
            //         src={`/assets/Thumbnails/${fileName}`}
            //         // alt={record.shot}
            //         alt={fileName}
            //         onError={(e) => (e.target.style.display = "none")}
            //         style={{
            //           width: "100px",
            //           height: "auto",
            //           maxWidth: "100%",
            //         }}
            //       />
            //       ) : (
            //       <div
            //         style={{
            //           width: "auto",
            //           wordWrap: "break-word",
            //           whiteSpace: "normal",
            //           padding: "10px",
            //           border: "1px solid #ccc",
            //         }}
            //       >
            //         {fileName}
            //       </div>
            //     );
            //   }
  
            //   return (
            //     <span
            //       onClick={() => handleCellClick(text, key, record)}
            //       style={{
            //         cursor: "pointer",
            //         display: "inline-block",
            //         width: "100%",
            //       }}
            //     >
            //       {text}
            //     </span>
            //   );
            // },

          }));
          setAssetBidTableData(data);
        setAssetBidTableColumns(columns);
        const excludedAssetKeys = [ "modeling", "rigging", "texturing","hair_and_fur","status"
          
        ];


        const newAssetsTextAreaColumns = columns
        .map((col) => col.key)
        .filter((key) => !excludedAssetKeys.includes(key));
        
      if (JSON.stringify(newAssetsTextAreaColumns) !== JSON.stringify(assetsTextAreaColumns)) {
        setAssetTextAreaColumns(newAssetsTextAreaColumns);
      }

        console.log("columnsdsss",columns)
        
       
        // Save to localStorage
        localStorage.setItem("assetBiddingTableData", JSON.stringify(data));
        localStorage.setItem(
          "assetBiddingTableColumns",
          JSON.stringify(columns)
        );

        hasShownAssetFetchError.current = false; 
      }
      // else if ( data.length==0){
      //   // message.error("No Data Found");
      //   notification.error({ description:"No Data Found"});
        
      // }
      
      else {

        if (!hasShownAssetFetchError.current) {
          hasShownAssetFetchError.current = true;
          // notification.error({ description: "No Data Found" });
          notification.error({ description: "No data available for this project." });
        }
        setAssetBidTableColumns([]);
        setAssetBidTableData([]);
   




        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem("assetBiddingTableData", JSON.stringify(data));
          localStorage.setItem("assetBiddingTableColumns", JSON.stringify(generateColumns(data)));
        } else {
          localStorage.removeItem("assetBiddingTableData");
          localStorage.removeItem("assetBiddingTableColumns");
        }
        // message.error("Error fetching data",)
        // notification.error({description:"Error fetching data"})
        
      }
    } catch (error) {
      console.error("Error fetching table data:", error);
      if (!hasShownAssetFetchError.current) {
        hasShownAssetFetchError.current = true;
        notification.error({ description: "Error fetching data from API." });
      }
    }finally{
      setLoading(false); 
    }
  };

  const handleShowTable = () => {
    if (selectedAssetBidProject && selectedAssetBidProject !== "select") {
      fetchAssetBidTableData(selectedAssetBidProject);
      setAssetShowTable(true);
      localStorage.setItem("assetsShowTable", true);
    } else {
      // message.warning("Please select a project first.");
      notification.warning({ description:"Please select a project first."});
    }
  };


  const showSendAssetBiddingDataModal = (created, rejected, rejectedData) => {
    setSuccessAssetCount(created);
    setRejectedAssetCount(rejected);
    setRejectedAssetObjects(rejectedData);
    setIsAssetDataModalVisible(true);
  };

  

  const sendAssetBiddingData = async (jsonData) => {
    console.log("jsonAssetData", jsonData)
    const url = `http://${ip_port}/assets/`;

  

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
       body: JSON.stringify(jsonData),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("responseDataaaa",responseData)

        showSendAssetBiddingDataModal(
          responseData.success,
          responseData.failed,
          responseData.failed_objects
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
  const handleAssetBiddingFileUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

        
        const headers = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })[0];
        console.log("headers", headers);

        const headersMatch =
          JSON.stringify(headers) === JSON.stringify(EXPECTED_ASSET_HEADERS);

        if (headersMatch) {
          // Print the data to the console if headers match
          const jsonAssetData = XLSX.utils.sheet_to_json(firstSheet);

          console.log("Asset Bidding Data:", jsonAssetData);

          sendAssetBiddingData(jsonAssetData);
        } else {
         
          // message.error(
          //   "The headers in the selected file do not match the expected headers."
          // ); 
          notification.error({
           description: "The headers in the selected file do not match the expected headers."
         });
        }
      };

      reader.readAsArrayBuffer(file);
    }
  };
  const resetAssetBiddingModalState = () => {
    setSuccessAssetCount(0);
    setRejectedAssetCount(0);
    setIsAssetDataModalVisible(false);
    setTimeout(() => {
      setSuccessAssetCount(0);
      setRejectedAssetCount(0);
      setRejectedAssetObjects([]);
    }, 200);
  };



 const handleAddAssetBiddingButtonClick=()=>{
  resetAssetBiddingModalState();
  fileInputRef.current.value = null;
  fileInputRef.current.click();

 }


 const handleAssetRowClick = (record) => {
  setIsLoading(true);
  
  
  setTimeout(() => {
    setSelectedAssetRow([record]);
  
    setIsLoading(false);
  }, 500);
};

 const exportRejectedAssetToExcel = () => {
  console.log("rejectedAssetObjects", rejectedAssetObjects)
  // const modifiedRejectedObjects = rejectedAssetObjects.map((item) => ({
  //   ...item,
  //   error:
  //     typeof item.error === "object"
  //       ? JSON.stringify(item.error)
  //       : String(item.error),
  // }));
  const worksheet = XLSX.utils.json_to_sheet(rejectedAssetObjects);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Rejected Data");
  XLSX.writeFile(workbook, "rejected_biddings.xlsx");
};


const handleAssetExcelExport=()=> {
  if (AssetBidTableData.length > 0) {

    const filteredAssetData = AssetBidTableData.map(({ _id, assigned_to, ...rest }) => rest);
    const worksheet = XLSX.utils.json_to_sheet(filteredAssetData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    XLSX.writeFile(workbook, `Project_${selectedAssetBidProject}_Data.xlsx`);
  } else {
    console.log("No data available to export.");
  }
}

const handleProjectChange =(projectKey)=>{
  setSelectedAssetBidProject(projectKey);

  if (projectKey === "select") {
    // message.warning("Please select a project");
    notification.warning({description:"Please select a project"});
  }
   setAssetShowTable(false);
   setAssetBidTableData([])
   setAssetBidTableColumns([])
   setAssetBidTableData([])
}


const selectedAssetTableColumns = [
  { title: "Field", dataIndex: "field", key: "field" },
  { title: "Value", dataIndex: "value", key: "value" },
];

const selectedAssetTableData =
  selectedAssetRow.length > 0
    ? assetFieldsDropdown.map((key, index) => ({
        key: index,
        field: key,
        value:
          typeof selectedAssetRow[0][key] === "object"
            ? JSON.stringify(selectedAssetRow[0][key])
            : selectedAssetRow[0][key] ?? "-",
      }))
    : [];


    const handleTableChange = (pagination, filters, sorter) => {
      const updatedParams = {
        pagination,
        filters,
        sorter: sorter.columnKey ? sorter : {},
      };
      setTableParams(updatedParams);
      localStorage.setItem("assetBidding_tableParams", JSON.stringify(updatedParams));
      
    };
    





  return (
    <div className="Asset_Bidding_Container">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          // justifyContent: "center",
          // alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
          padding: "10px 0",
        }}
      >
       
          <label
            htmlFor="project_dropdown"
            style={{
              marginRight: "5px",
              textAlign: "center",
              borderRadius: "5px",
            }}
          >
            Project:
          </label>
          <Dropdown overlay={projectListMenu} trigger={["click"]} onChange={handleProjectChange}>
          <Button style={{width:"140px"}}id="project-dropdown">
              {selectedAssetBidProject && selectedAssetBidProject !== "select"
               ? selectedAssetBidProject
              : "Select an option"}
</Button>

          </Dropdown>
      

        {/* <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: "10px",
          }}
        > */}
          {(designation === "Manager"|| "TeamLead"|| "Supervisor" )&& (
            <>

               <input
                  type="file"
                  accept=".xlsx, .xls"
                  style={{ display: "none" }}
                  ref={fileInputRef}
                  onChange={handleAssetBiddingFileUpload}
                />
              <Button
                type="default"
                style={{ marginLeft: "30px" }}
                  onClick={handleAddAssetBiddingButtonClick}
              >
                AddBiddingData
              </Button>

                 
              {/* <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItem: "center",
          justifyContent: "center",
          // marginTop: "21px",
        }}
      > */}
        <Button
          type="primary"
          disabled={
            !selectedAssetBidProject || selectedAssetBidProject === "select"
          }
          onClick={handleShowTable}
        >
          Show Table
        </Button>
      {/* </div> */}




              <>
                {/* <Button
                  type="default"
                  style={{ marginLeft: "20px" }}
                  onClick={handleAddAssetMandaysButtonClick}
                >
                  Add Mandays
                </Button> */}

                
                <label htmlFor="field" style={{ marginTop: "8px" , marginLeft:"750px"}}>
                  Fields:
                </label>
                <Dropdown overlay={assetsFieldsMenu}trigger={["click"]}>
                <Button id="field" style={{ marginRight: "15px" }}>
                 {selectedAssetField}
                </Button>
                </Dropdown>

                {/* <Button type="default"  onClick={() => setIsAssetArtistModalVisible(true)}>Select Artist</Button> */}
                <Button
                    type="default"
                    onClick={() => {
                        if (!selectedAssetField || selectedAssetField === "Select a field") {
                            //  message.error("Please select a field first.");
                             notification.error({ description:"Please select a field first."});
                             return;
                            }

                   const fieldValue = parseFloat(selectedAssetRow?.[0]?.[selectedAssetField] ?? 0);

                   if (isNaN(fieldValue) || fieldValue <= 0) {
                    //  message.error(`"${selectedAssetField}" value must be greater than 0 to assign.`);
                     notification.error({description:`"${selectedAssetField}" value must be greater than 0 to assign.`});
                     return;
                    }

                      setIsAssetArtistModalVisible(true); 
                    }}
                 >
                   Select Artist
               </Button>

              </>


              <Button
                  type="default"
                  // style={{ marginLeft: "20px", marginRight: "20px" }}
                  style={{marginLeft: "auto" , marginTop:"22px"}}
                  onClick={handleAssetExcelExport}
                >
                  Excel Export
                </Button>

            </>
          )}
        </div>
      {/* </div> */}

      {/* <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItem: "center",
          justifyContent: "center",
          marginTop: "21px",
        }}
      >
        <Button
          type="primary"
          disabled={
            !selectedAssetBidProject || selectedAssetBidProject === "select"
          }
          onClick={handleShowTable}
        >
          Show Table
        </Button>
      </div> */}
 

      {showAssetTable && selectedAssetBidProject && (
     <Spin spinning={loading}>
    {AssetBidTableData.length === 0 ? (
      <Alert
        message="No Data"
        description={`No data available for ${selectedAssetBidProject}.`}
        type="info"
        showIcon
        style={{ marginTop: "60px", border: "2px solid #ccc" }}
      />
    ) : (
      <div style={{ marginTop: "15px" }}>
        <div
          style={{
            height: "160px",
            position: "relative",
          }}
        >
          {isLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Spin size="large" />
            </div>
          ) : (
            <TextArea
              value={assetPersistedText || "Click on a row to view details"}
              rows={8}
              readOnly
              style={{
                marginBottom: "16px",
                marginTop: "15px",
                width: "100%",
                fontSize: "14px",
                whiteSpace: "pre",
                fontFamily: "monospace",
              }}
            />
          )}
        </div>
      </div>
    )}
  </Spin>
)}



      

      {AssetBidTableData.length > 0 && (

        <div className="scrollable-table-wrapper">
        <Table
          className="custom-table"
          dataSource={AssetBidTableData}
          columns={AssetBidTableColumns}
         
          // pagination={tableParams.pagination}
          // filter={tableParams.filters}
          // pagination={false}
          onRow={(record) => ({
            onClick: () => handleAssetRowClick(record),
          })}
         
          onChange={handleTableChange}
          rowKey={(record, index) => record.id || index}
         
          scroll={{ x:'max-content', y: 'calc(100vh - 450px)' }}
          style={{ marginTop: "50px" }}

           // onChange={(pagination, filters, sorter) => {
          //   const sortData = {
          //     field: sorter.field,
          //     order: sorter.order,
          //   };
          //   localStorage.setItem("assetBidSorter", JSON.stringify(sortData));
          // }}
           // pagination={{
          //   current: currentPage,
          //   pageSize: pageSize,
          //   onChange: (page, pageSize) => {
          //     setCurrentPage(page);
          //     setPageSize(pageSize);
          //     localStorage.setItem("assetBidCurrentPage", page);
          //     localStorage.setItem("assetBidPageSize", pageSize);
          //   },
          // }}
          // pagination={false}
          // filteredValue={tableParams.filters || {}}
          // sortOrder={tableParams.sorter?.order}
          // sortDirections={["descend", "ascend"]}
        />
        </div>
      )}

<Modal
          title="Asset Bidding Data Result"
          visible={isAssetDataModalVisible}
          onOk={resetAssetBiddingModalState}
          onCancel={resetAssetBiddingModalState}
          footer={[
            <Button key="close" onClick={resetAssetBiddingModalState}>
              Close
            </Button>,
            <Button
              key="export"
              onClick={exportRejectedAssetToExcel}
              disabled={rejectedAssetCount === 0}
            >
              Rejected Data
            </Button>,
          ]}
        >
          <p>Success Count: {successAssetCount}</p>
          <p>Rejected Count: {rejectedAssetCount}</p>
        </Modal>


        <Modal
             title="Select Artist"
           
             visible={isAssetArtistModalVisible}
             width={1000}
            //  styles={{
             bodyStyles= {{
              height: 500,
              overflow: "auto", 
              display: "flex",
             
               
        
            }}
          // }}

            footer={[
                    <Button
                  key="assign"
                 type="primary"
                 onClick={async() => {
                  if (!selectedAssetField || selectedAssetField === "Select a field") {
                    // message.error("Please select a field first.");
                    notification.error({description:"Please select a field first."});
                    return;
                  }
              
                  
                  const bidRow = selectedAssetTableData.find(
                    (row) => row.field === selectedAssetField
                  );
                  const allowedValue = parseFloat(bidRow?.value ?? 0);
              
                 
                  const assignedValue = parseFloat(
                    assetMandaysTableData?.[0]?.[selectedAssetField] ?? 0
                  );
              
                 
                  const newValue = parseFloat(selectedAssetRow?.[0]?.[selectedAssetField] ?? 0);
              
                  if (isNaN(allowedValue) || isNaN(assignedValue) || isNaN(newValue)) {
                    // message.error("Invalid data found in selected field values.");
                    notification.error({description:"Invalid data found in selected field values."});
                    return;
                  }
              
                
                  if (assignedValue + newValue > allowedValue) {
                    // message.error(
                    //   `Cannot assign task. Total exceeds allowed limit of ${allowedValue} for "${selectedAssetField}".`
                    // );
                    
                    notification.error({
                      description:`Cannot assign task. Total exceeds allowed limit of ${allowedValue} for "${selectedAssetField}".`
                  });
                    return;
                  }





              try{




                 console.log("Selected Artist:", selectedAssetArtist);
                  await handleAssignAssetTask(selectedAssetRow,selectedAssetArtist,setIsAssetArtistModalVisible,
                  selectedAssetField,DEFAULT_DEPARTMENT,user,accessToken,)
              //  handleAssignArtist(selectedAssetArtist);
                setIsAssetArtistModalVisible(false);
                fetchAssetBidTableData(projectRef.current);

                // message.success("Assigned successfully and table reloaded.");
                notification.success({description:"Assigned successfully and table reloaded."});
              } catch (err) {
                console.error("Assignment failed:", err);
                // message.error("Assignment failed.");
                notification.error({description:"Assignment failed."});
              }
      }}
    >
      Assign
    </Button>,
  ]}
           onCancel={() => setIsAssetArtistModalVisible(false)}
       >
       
       <div style={{ maxHeight: "400px", overflowY: "auto" }}>
    <h3>Assign Bid Asset Mandays Table</h3>
    {(() => {
  const { columns, dataSource } = formatSelectedAssetRowForTable(selectedAssetTableData);
  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      pagination={false}
      size="small"
      bordered
      style={{ marginBottom: 30 }}
    />
  );
})()}




    <h3 style={{ marginTop: 20 }}>Assign Asset Mandays Table</h3>
    <Table
      dataSource={assetMandaysTableData}
      columns={assetMandaysTableColumns}
      pagination={ false }
      size="small"
      // scroll={{ x: true }}
      bordered
    />


       <Radio.Group
           onChange={(e) => setSelectedAssetArtist(e.target.value)}
            value={selectedAssetArtist}
            style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop:"28px"  }} 
           >
          {(globalShotsObject?.asset || []).map((artist, index) => (
        <Radio key={index} value={artist}>
        {artist}
      </Radio>

    ))}
  </Radio.Group>

</div>
  
  
</Modal>


    </div>
  );
};

export default AssetBidding;

 // useEffect(() => {
  //   const savedParams = localStorage.getItem("bidding_tableParams");
  //   if (savedParams) {
  //     setTableParams(JSON.parse(savedParams));
  //   } else {
  //     setTableParams({
  //       pagination: { current: 1, pageSize: 10 },
  //       filters: {},
  //       sorter: {},
  //     });
  //   }
  // }, []);