import React, { useState, useEffect, useRef} from "react";
import { useMemo } from "react";
import {Menu,Dropdown,Button,Table,Spin,Alert,message,Input,Modal,Radio,Checkbox,Row} from "antd";
import axios from "axios";
import { useAuth } from "./AuthContext";
import "./Shots.css";
import { ip_port } from "./Configs";
// import { getGlobalShotsData } from "./globalShotsState";
// import { loadShotsData, getShotsData } from "./utils";
import {Card, InputNumber} from "antd"

import {handleAssignTask} from "./shotsHandleAssignTask"
import {handleAssignSplitTasksMandaysClick} from "./shotsAssignSplitTasksMandaysClick"
import { getHighlightedStyle } from "./shotsAssignedCellColor";
import {handleCellClick} from "./shotsAssignedCellColor";
import {ShotsProjMenu} from "./shotsDropdownMenuClicks"
import { ShotsDeptMenu } from "./shotsDropdownMenuClicks";
import {FieldsMenu} from "./shotsDropdownMenuClicks";
import { getMenuItems } from "./shotsGetFieldsMenu"; 
import {AssignedMandaysTable} from "./Assigned_Mandays_Table_Shots";
import ExcelJS from "exceljs";
import {saveAs} from "file-saver";




const Shots = ({darkTheme}) => {
  const { userControls, filteredData, accessToken, designation, user } =
    useAuth();
    console.log("shots depts list token1",accessToken);
  // const [globalShotsObject, setGlobalShotsObject] = useState(
  //   getGlobalShotsData()
  // );

  const loadShotsData = async () => {
    try {
      
  
      const response = await axios.get("http://192.168.80.193:8888/users_data/")
      const data =  response.data;
      console.log("response_for_users_data", response)
      console.log("---------------",data);
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


  const [globalShotsObject, setGlobalShotsObject] = useState(getShotsData());
  const [projOptions, setProjOptions] = useState([]);
  const [deptOptions, setDeptOptions] = useState([]);
  const [selectedFields, setSelectedFields] = useState(
    localStorage.getItem("shotsSelectedField") || null
  );
 const [selectedWindowField, setSelectedWindowField] = useState(
  localStorage.getItem("shotsSelectedWindowField")|| null
 )
 
 const [selectedProject, setSelectedProject] = useState(
    localStorage.getItem("shotsSelectedProject") || null
  );
  const [selectedDept, setSelectedDept] = useState(
    localStorage.getItem("shotsSelectedDept") || null
  );
  const [showTable, setShowTable] = useState(
    JSON.parse(localStorage.getItem("shotsShowTable")) || false
    // JSON.parse(localStorage.getItem("shotsShowTable")) || false
  );
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [authorizedDepartments, setAuthorizedDepartments] = useState([]);
  const [AuthorizedHeaders, setAuthorizedHeaders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [selectedRowData, setSelectedRowData] = useState([]);

  const [shotsTextAreaColumns, setShotsTextAreaColumns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [persistedText, setPersistedText] = useState("");
  const [artistPopupVisible, setArtistPopupVisible] = useState(false);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState([]);
  const [selectedAssignSplitArtist,setAssignSplitArtist] = useState([])

 const [selectedAssignSplitTaskArtists,setSelectedAssignSplitTasksArtists] = useState([])
 const [assignSplitPopUp,setAssignSplitPopUp]= useState(false);
 const [selectedFieldTableData, setSelectedFieldTableData] = useState([]);
 const hasUpdatedShotsColumns = useRef(false);
 const [refreshTrigger, setRefreshTrigger] = useState(0);




  const [assignSplitData, setAssignSplitData] = useState({});
  const [showAssignSplitTable, setShowAssignSplitTable] = useState(false);
  const [totalMandays, setTotalMandays] = useState(0);
  const [hasShownAlert, setHasShownAlert] = useState(false);
  
  const [confirmedAssignSplitArtist, setConfirmedAssignSplitArtist] = useState([]);
  const [assignedMandaysData, setAssignedMandaysData] = useState([]);


  
  const prevProjectRef = useRef(null);


  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 100 },
    filters: {},
    sorter: {},
  });

  const pageSize = 10;
  const { TextArea } = Input;
  const assignedMandaysRef = useRef([]);


  
  const filteredRowData = selectedRowData.map((row) =>
    Object.fromEntries(
      Object.entries(row).filter(([key]) => shotsTextAreaColumns.includes(key))
    )
  );

  const maxKeyLength = Math.max(
    ...shotsTextAreaColumns.map((col) => col.length)
  );


 
  useEffect(() => {
    if (selectedRowData.length && selectedDept && shotsTextAreaColumns.length > 0) {
      const formatted = filteredRowData
        .map((row) =>
          shotsTextAreaColumns
            .map((col) => {
              const value = String(row[col] ?? "_").trim();
  
              const label = `${col}:`.padEnd(maxKeyLength + 2, " ");
              return `${label}${value}`;
            })
            .join("\n")
        )
        .join("\n\n");
  
      setPersistedText(formatted);
    }
  }, [selectedRowData, selectedDept, shotsTextAreaColumns,filteredRowData]);
  

  useEffect(() => {
    if (!selectedProject || selectedProject === "select") return;
  
    if (
      prevProjectRef.current &&
      prevProjectRef.current !== selectedProject
    ) {
      setPersistedText("Click on a row to view details");
      // localStorage.removeItem("shotsText");
      // localStorage.removeItem("shotsTextProject");
      
      // localStorage.removeItem("shotsTextDept");
      localStorage.removeItem(`shotsText_${prevProjectRef.current}_${selectedDept}`);
      setSelectedRowData([]);
    }
  
    prevProjectRef.current = selectedProject;
  }, [selectedProject]);



  useEffect(() => {
    console.log("before getting users")
    const fetchShots = async () => {
      const data = await loadShotsData();
      console.log("users_data",data)
      setGlobalShotsObject(data); 
    };
    fetchShots();
    console.log("after getting users")
  }, []);
  




  useEffect(() => {
    const savedField = localStorage.getItem("shotsSelectedField");
    if (savedField) {
      setSelectedFields(savedField);
    }
  }, []);

 


  useEffect(() => {
    if (!selectedProject || !selectedDept || selectedDept === "select") return;
  
    setSelectedRowData([]);
    setPersistedText("Click on a row to view details");
    hasUpdatedShotsColumns.current = false;
  
    localStorage.removeItem("shotsText");
    localStorage.removeItem(`shotsText_${selectedDept}`);
  }, [selectedProject]);
  


  useEffect(() => {
    if (
      selectedDept &&
      selectedProject&&
      persistedText &&
      persistedText !== "Click on a row to view details"
    ) {
      
      localStorage.setItem("shotsText", persistedText);
      localStorage.setItem("shotsTextProject", selectedProject);
      localStorage.setItem("shotsTextDept", selectedDept);
      
    }
  }, [persistedText, selectedDept, selectedProject]);
  
  useEffect(() => {
    const savedProject = localStorage.getItem("shotsTextProject");
    const savedDept = localStorage.getItem("shotsTextDept");
    const savedText = localStorage.getItem("shotsText");
  
    if (
      savedProject === selectedProject &&
      savedDept === selectedDept &&
      savedText
    ) {
      setPersistedText(savedText);
    } else {
      setPersistedText("Click on a row to view details");
    }
  }, [selectedProject, selectedDept]);
  
  


  useEffect(() => {
    if (
      selectedProject &&
      selectedDept &&
      selectedDept !== "select"
    ) {
      const savedText = localStorage.getItem(`shotsText_${selectedDept}`);
      if (savedText) {
        console.log("Restoring from localStorage:", savedText);
        setPersistedText(savedText);
      } else {
        setPersistedText("Click on a row to view details");
      }
    }
  }, [selectedProject, selectedDept]);
  

  useEffect(() => {
    if (selectedDept && persistedText &&  persistedText !== "Click on a row to view details") {
      localStorage.setItem(`shotsText_${selectedProject}_${selectedDept}`, persistedText);
      localStorage.setItem("shotsText", persistedText);
    }
  }, [persistedText, selectedDept]);

  useEffect(() => {
    fetchProjOptions();
    fetchDeptOptions();
  }, []);

  useEffect(() => {
    if (showTable && selectedDept && selectedDept !== "select") {
      fetchData();
    }
  }, [showTable, selectedDept]);
  

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
    setDeptOptions(AuthHeaders);
  }, [authorizedDepartments]);

  useEffect(() => {
    const savedTableState = localStorage.getItem("tableState");
    if (savedTableState) {
      const parsedState = JSON.parse(savedTableState);
      setTableParams(parsedState);
      setCurrentPage(parsedState.pagination?.current || 1);
      fetchData(parsedState.pagination?.current || 1);
    } else {
      fetchData(1); 
    }
  }, []);



useEffect(() => {
  if (data.length > 0 && selectedDept) {
    updateShotsColumns();
  }
}, [data, selectedDept,tableParams]);


  
  useEffect(() => {
    if (!selectedDept || selectedDept === "select") return;
  
    const fields = filteredData[0]?.bid_micro[selectedDept] || [];
  
    // if (JSON.stringify(fields) !== JSON.stringify(selectedFields)) {
    //   setSelectedFields(fields);
    // }
  
    if (selectedFields&&!fields.includes(selectedFields)) {
      setSelectedFields(null);
      localStorage.removeItem("shotsSelectedField");
    }
  
    setSelectedWindowField(null);
    localStorage.removeItem("shotsSelectedWindowField");
  // }, [selectedDept, selectedFields, filteredData]);
  }, [selectedDept,  filteredData]);
  
const subFields = useMemo(() => {
      if (!selectedDept || selectedDept === "select") return [];
      return [
        selectedDept.toLowerCase(),
        ...(filteredData[0]?.bid_micro[selectedDept] || []),
      ];
    }, [selectedDept, filteredData]);
    

 useEffect(() => {
    if (persistedText && subFields.length > 0) {
      const lines = persistedText.split("\n");
    
     
      const fieldTableData = [];
  
      subFields.forEach((field) => {
        const line = lines.find((line) =>
          line.trim().startsWith(`${field}:`)
        );
       
  
        if (line) {
          const value = line.split(":")[1]?.trim() || "_";
          fieldTableData.push({ key: field, value });
        }
      });
      // console.log("fieldTableData", fieldTableData)
      setSelectedFieldTableData(fieldTableData);
    }
  }, [persistedText, subFields])
 
  


const fetchProjDepts = async (project) => {
    console.log("shots depts list token",accessToken);
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
      console.log("data", data);

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Unexpected data format or empty data array.");
      }
      console.log("shotprojdatas", data[0].departments);
      // setAuthorizedDepartments(data[0].departments)
      return eval(data[0].departments);
    } catch (error) {
      console.error("Error fetching project departments data:", error);
      return null;
    }
  };


  useEffect(() => {
    if (showTable && selectedProject) {
      fetchData();
    }
  }, [showTable, selectedProject]);

 

  useEffect(() => {
    const loadInitialData = async () => {
      const savedProject = localStorage.getItem("shotsSelectedProject");
      const savedDeptOption = localStorage.getItem("shotsSelectedDept");

      const savedAuthorizedHeaders =
        JSON.parse(localStorage.getItem("shotAuthorizedHeaders")) || [];
      if (savedProject) {
        setSelectedProject(savedProject);
        const projDepts = await fetchProjDepts(savedProject);
        setAuthorizedDepartments(projDepts);
      }

      if (savedAuthorizedHeaders.length > 0) {
        setAuthorizedHeaders(savedAuthorizedHeaders);
        setSelectedDept(savedAuthorizedHeaders);
      }

      if (savedDeptOption && savedDeptOption !== "select") {
        setSelectedDept(savedDeptOption);
      } else {
        setSelectedDept("select");
      }
    };

    loadInitialData();
    fetchProjOptions();
    fetchDeptOptions();
  }, []);

  
  const transformedRow = useMemo(() => {
    return selectedFieldTableData.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
  }, [selectedFieldTableData]);
  const  selectedWindowFieldLabel= selectedWindowField || "Select a field";
  console.log("selectedWindowField",selectedWindowField)





  useEffect(() => {
    if (!showAssignSplitTable) return;
  
    if (Object.keys(assignSplitData).length === 0) return; // Wait until data is set
  
    const totalAssigned = Object.values(assignSplitData).reduce(
      (acc, curr) => acc + parseFloat(curr || 0),
      0
    );
  
    const maxAllowed = parseFloat(transformedRow?.[selectedWindowFieldLabel] || 0);
    const roundedTotal = parseFloat(totalAssigned.toFixed(1));
    setTotalMandays(roundedTotal);
  
    const EPSILON = 0.0001;
    const isExceeding = (roundedTotal - maxAllowed) > EPSILON;
  
    if (isExceeding && !hasShownAlert) {
      alert(`Total mandays (${roundedTotal}) exceed available value (${maxAllowed.toFixed(1)}) for "${selectedWindowFieldLabel}"`);
      setHasShownAlert(true);
    }
  
    if (!isExceeding && hasShownAlert) {
      setHasShownAlert(false);
    }
  }, [assignSplitData, showAssignSplitTable, transformedRow, selectedWindowFieldLabel]);
  


 
  const fetchProjOptions = async () => {
    console.log(" shots accessToken",accessToken)
    try {
      const response = await axios.get(`http://${ip_port}/projects_list/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      // const projectCodes = response.data.map((project) => project.project_code);
      const projectCodes = response.data;
      console.log("projectCodes", projectCodes);
      setProjOptions(projectCodes);
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
    console.log("savedAuthorizedHeaders",savedAuthorizedHeaders)
    if (savedAuthorizedHeaders && savedAuthorizedHeaders.length > 0) {
      setDeptOptions(savedAuthorizedHeaders);
    } else {
      setDeptOptions(AuthorizedHeaders);
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
    fetchData(pagination.current);
  };

  const fetchData = () => {
    if (selectedProject) {
      setLoading(true);
      axios
        .get(
          // `http://${ip_port}/all_bid_data/?proj=${selectedProject}`,
          `http://${ip_port}/all_bid_data/?proj=${selectedProject}`,
          {
            params: {
              // page: currentPage,
              page: currentPage,
              pageSize: pageSize,
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
          // setData([...fetchedData]);
          // setAssignedMandaysData(fetchedData);
          // updateShotsColumns()
          setLoading(false);
          // updateShotsColumns(fetchedData);
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

  const resetToInitialStatesShots = () => {
    setSelectedProject("select");
    localStorage.setItem("shotsSelectedProject", "select");

    setSelectedDept("select");
    localStorage.setItem("shotsSelectedDept", "select");

    setShowTable(false);
    localStorage.setItem("shotsShowTable", false);
    setData([]);
    setAuthorizedDepartments([]);
  };
  const handleProjClick = async (e) => {
    if (e.key === "select") {
      message.warning("Select an option");
      // resetToInitialStatesShots();
      return;
    }

    setSelectedProject(e.key);
    localStorage.setItem("shotsSelectedProject", e.key);

    setSelectedDept("select");
    localStorage.setItem("shotsSelectedDept", "select");

    setShowTable(false);
    localStorage.setItem("shotsShowTable", false);
    setData([]);
    setColumns([]);

    const shotProjDepts = await fetchProjDepts(e.key,accessToken);
    console.log("projDepts", eval(shotProjDepts));
    setAuthorizedDepartments(shotProjDepts);
  };

  const getHeaders = () => {
    const headers = [];

    headers.push(...filteredData[0].base_columns);

    if (selectedDept && selectedDept !== "select") {
      console.log("Selected Department:", selectedDept);

      headers.push(selectedDept.toLowerCase());

      const deptSubColumns = filteredData[0].bid_micro[selectedDept] || [];
      headers.push(...deptSubColumns);
    }

    return headers;
  };



  const handleCellDoubleClick = async(record, key) => {
    console.log("record:", record,"key:", key)
    const cellStyle = getHighlightedStyle(record, key);
    const isHighlighted = cellStyle && !!cellStyle.background;
     console.log("isHighlighted", isHighlighted)
    // if (isHighlighted) {
     
    //   console.log("Show popup for", key, record);
    //   showPopupForCell(key, record);
    // } else {
    //   // You can use message.error from AntD
    //   message.error("This cell is not eligible for editing.");
    // }

    if (!isHighlighted) {
      message.warning("This cell is not highlighted.");
      return;
    }
  
    const columnName = key;
    const shotName = record.shot;
  
    try {
      const response = await fetch(`http://${ip_port}/calc_artists/?shot=${shotName}&field=${columnName}`);
      if (!response.ok) throw new Error("Failed to fetch");
       const result = await response.json();
        console.log("result in double click modal:", result)
      Modal.info({
        title: `Details for "${shotName}" - "${columnName}"`,
        width: 600,
        content: (
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {/* <pre>{JSON.stringify(result, null, 2)}</pre> */}
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
      message.error("Error fetching data from API.");
    }
  };
  







const updateShotsColumns = () => {
    if (filteredData.length > 0 && userControls.length > 0) {
      const headers = getHeaders();

      const calculateColumnWidth = (key, data) => {
        const padding = 40;
        const maxLength = Math.max(
          ...data.map((item) => (item[key] ? item[key].toString().length : 0)),
          key.length
        );

       
        let calculatedWidth = maxLength * 10 + padding;

        return Math.min(Math.max(120, calculatedWidth), 800);
      };

      const fetchedShotsColumns = headers

        .filter((key) => key !== "_id")
        .map((key, index) => ({
          title: key,
          dataIndex: key,
          key: key,
         
          width: calculateColumnWidth(key, data),
          ellipsis: true,
          fixed: index < 5 ? "left" : false,

          // filters: [
          //   ...Array.from(new Set(data.map((item) => item[key]))).map(
          //     (value) => ({
          //       text: value,
          //       value: value,
          //     })
          //   ),
          // ],

        filters: data?.length
        ? [...new Set(data.map((item) => item[key]).filter(Boolean))].map(
          
        (value) => ({
        text: String(value),
        value,
      })
    )
  : [],
  // filteredValue: tableParams?.filters?.[key] || null,
  // filteredValue:
  // tableParams?.filters?.[key]?.length > 0
  //   ? tableParams.filters[key]
  //   : null,
  filteredValue:
  tableParams?.filters?.[key]?.length > 0 &&
  new Set(data.map((item) => item[key])).has(tableParams.filters[key][0])
    ? tableParams.filters[key]
    : null,


  filterSearch: true,
  onFilter: (value, record) => record[key] === value,
   
  

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

          onCell: (record) => ({
            style: getHighlightedStyle(record, key), 
            onDoubleClick: () => handleCellDoubleClick(record, key),
         
            
          }),
          render: (text, record) => {
            if (key === "thumbnail") {
              const isImagePath = text.match(/\.(jpeg|jpg|gif|png)$/i);
              // const isImagePath = (text ?? "").toString().match(/\.(jpeg|jpg|gif|png)$/i);

             
             
              return isImagePath ? (
                <img
                  src={`/assets/Thumbnails/${text}`}
                  alt={record.shot}
                  onError={(e) => (e.target.style.display = "none")}
                  // style={{
                  //   width: "100px",
                  //   height: "auto",
                  //   maxWidth: "100%",
                  // }}
                />
              ) : (
                <div
                  style={{
                    width: "auto",
                    wordWrap: "break-word",
                    whiteSpace: "normal",
                    // padding: "10px",
                    border: "1px solid #ccc",
                  }}
                >
                  {text}
                </div>
              );
            }

            return (
              <span
                onClick={() => handleCellClick(text, key, record)}
                style={{
                  cursor: "pointer",
                  display: "inline-block",
                  width: "100%",
                }}
              >
                {text}
              </span>
            );
          },
        }));



  //     const fetchedShotsColumns = headers
  // .filter((key) => key !== "_id")
  // .map((key, index) => {
  //   const uniqueFilterValues =
  //   data && data.length > 0
  //     ? Array.from(
  //         new Set(
  //           data
  //             .map((item) => item?.[key])
  //             .filter((val) => val !== undefined && val !== null && val !== "")
  //         )
  //       )
  //     : [];
  
  //   return {
  //     title: key,
  //     dataIndex: key,
  //     key: key,
  //     width: calculateColumnWidth(key, data),
  //     ellipsis: true,
  //     fixed: index < 5 ? "left" : false,
  //     filters: uniqueFilterValues.map((value) => ({
  //       text: value.toString(),
  //       value: value,
  //     })),
  //     onFilter: (value, record) => record[key] === value,
  //     sorter: (a, b) => {
  //       if (typeof a[key] === "number") {
  //         return a[key] - b[key];
  //       } else if (typeof a[key] === "string") {
  //         return a[key].localeCompare(b[key]);
  //       }
  //       return 0;
  //     },
  //     sortDirections: ["descend", "ascend"],
  //     onCell: (record) => ({
  //       style: getHighlightedStyle(record, key),
  //       onDoubleClick: () => handleCellDoubleClick(record, key),
  //     }),
  //     render: (text, record) => {
  //       if (key === "thumbnail") {
  //         const isImagePath = text.match(/\.(jpeg|jpg|gif|png)$/i);
  //         return isImagePath ? (
  //           <img
  //             src={`/assets/Thumbnails/${text}`}
  //             alt={record.shot}
  //             onError={(e) => (e.target.style.display = "none")}
  //             style={{ width: "100px", height: "auto", maxWidth: "100%" }}
  //           />
  //         ) : (
  //           <div
  //             style={{
  //               width: "auto",
  //               wordWrap: "break-word",
  //               whiteSpace: "normal",
  //               padding: "10px",
  //               border: "1px solid #ccc",
  //             }}
  //           >
  //             {text}
  //           </div>
  //         );
  //       }

  //       return (
  //         <span
  //           onClick={() => handleCellClick(text, key, record)}
  //           style={{
  //             cursor: "pointer",
  //             display: "inline-block",
  //             width: "100%",
  //           }}
  //         >
  //           {text}
  //         </span>
  //       );
  //     },
  //   };
  // });


      setColumns([...fetchedShotsColumns]);
      const excludedKeys = [ "reel", "priority", "type","frames","duration","thumbnail","exr","sow","cgi_character","cgi_creature",
        "cgi_asset",
      ];
    

      const newShotsTextAreaColumns = fetchedShotsColumns
      .map((col) => col.key)
      .filter((key) => !excludedKeys.includes(key));
      
    if (JSON.stringify(newShotsTextAreaColumns) !== JSON.stringify(shotsTextAreaColumns)) {
      setShotsTextAreaColumns(newShotsTextAreaColumns);
    }
      console.log("ccolumns", fetchedShotsColumns);
    }
  };

  const handleDeptClick = (e) => {
    if (e.key === "select") {
      message.warning("Select an option");
     
    }
    setSelectedDept(e.key);
    localStorage.setItem("shotsSelectedDept", e.key);

    // updateShotsColumns();
  };

  const handleFieldSelect = ({key}) => {
    console.log("selectedkey", key)
    setSelectedFields(key);
    localStorage.setItem("shotsSelectedField", key);
  };


  const handleShowTable = () => {
    console.log("shotstablecolumns", columns)
    console.log("shotstabledata", data)
    setShowTable(true);
    localStorage.setItem("shotsShowTable", true);
  };

  const selectedFieldLabel = selectedFields || "Select field";
  // const  selectedWindowFieldLabel= selectedWindowField || "Select a field";
  const handleSelectArtist = (selectedDept) => {
    setArtistPopupVisible(true);
    console.log("selected_depttt", selectedDept);
    if (globalShotsObject[selectedDept]) {
      const selected = globalShotsObject[selectedDept];
      setSelectedArtists(selected);
    
      setSelectedArtist(null);
      console.log("Selected Artists for", selectedDept, ":", selectedArtists);
    
    } else {
      console.error("Department not found!");
      return [];
    }
  };

  const handleRowClick = (record) => {
    setIsLoading(true);
    setShowAssignSplitTable(false)
    setAssignSplitArtist([]);
    setTimeout(() => {
      setSelectedRowData([record]);
    
      setIsLoading(false);
    }, 500);
  };

  const handleWindowFieldSelect=({key})=>{
          setSelectedWindowField(key)
           
          localStorage.setItem("shotsSelectedWindowField", key)
  }

 const handleAssignSplitTask = (selectedDept) => {
  // Assigned_Mandays_Table()
  setAssignSplitPopUp(true)
  console.log("working...")
  console.log("startdata",globalShotsObject[selectedDept])

  if (globalShotsObject[selectedDept]) {
    const selectAssignSplitArtist = globalShotsObject[selectedDept];
    console.log('selectAssignSplitArtist', selectAssignSplitArtist)
    setSelectedAssignSplitTasksArtists(selectAssignSplitArtist)
    // setAssignSplitArtist(null);
    console.log("Selected Artists for assigning split task", selectedDept, ":", selectAssignSplitArtist);
  }else{
    console.error("Department not found!")
  }
}

const horizontalColumns = useMemo(() => {
  return Object.keys(transformedRow).map((key) => ({
    title: key,
    dataIndex: key,
    key: key,
  }));
}, [transformedRow]);


const horizontalData = useMemo(() => [transformedRow], [transformedRow]);

const getShotFromText = (text) => {
  const lines = text.split('\n');
  const shotLine = lines.find(line => line.trim().startsWith('shot:'));
  return shotLine?.split(':')[1]?.trim() || '';

};


const shotName = getShotFromText(persistedText);



console.log("Extracted shot:", shotName);



const handleMandaysChange = (artist, value) => {


  const parsedValue = parseFloat(value || 0);

  // Simulate the updated assignSplitData
  const updatedData = {
    ...assignSplitData,
    [artist]: parsedValue,
  };
  
  console.log("updatedData" ,updatedData)
  // Calculate the new total
  const newTotal = Object.values(updatedData).reduce(
    (acc, curr) => acc + parseFloat(curr || 0),
    0
  );

  const maxAllowed = parseFloat(transformedRow?.[selectedWindowFieldLabel] || 0);
  console.log("newTotal", newTotal)
  console.log("maxAllowed", maxAllowed)

  if (newTotal.toFixed(1) > maxAllowed) {
    alert(`Total mandays (${newTotal.toFixed(1)}) exceed available value (${maxAllowed.toFixed(1)}) for ${selectedWindowFieldLabel}`);
    return; 
  }

  
  setAssignSplitData(updatedData);
  // setAssignSplitData(prev => ({
  //   ...prev,
  //   [artist]: value
  // }));
};
const handleRemoveRow = (artistName) => {
  console.log("artistNAme",artistName)
  const updatedArtists = selectedAssignSplitArtist.filter(artist => artist !== artistName);
  setAssignSplitArtist(updatedArtists);

  const updatedAssignSplitData = { ...assignSplitData };
  delete updatedAssignSplitData[artistName];
  setAssignSplitData(updatedAssignSplitData);

  const updatedConfirmed = confirmedAssignSplitArtist.filter(
    (artist) => artist !== artistName
  );
  setConfirmedAssignSplitArtist(updatedConfirmed);

  
  const removedValue = parseFloat(assignSplitData[artistName] || 0);
  setTotalMandays((prev) => parseFloat((prev - removedValue).toFixed(1)));
 
};

const splitTableColumns = [
  {
    title: "Artist",
    dataIndex: "artist",
    key: "artist",

  },
  {
    title: "Mandays",
    dataIndex: "mandays",
    key: "mandays",
    render: (_, record) => (
      <div className="mandays-cell">
      <InputNumber
       type="number"
        step={0.1}
        min={0}
        value={assignSplitData[record.artist]}
     
        onChange={(value) => handleMandaysChange(record.artist, value)}
        // }
      />
       <Button
        danger
        size="small"
        className="remove-btn"
        onClick={() => handleRemoveRow(record.artist)}
      >
       Remove
      </Button>
      </div>
    ),
  },

];

const splitTableData = confirmedAssignSplitArtist.map((artist, index) => ({

  key: index,
  artist,
  mandays: assignSplitData[artist] || 0.0,
}));




const checkMandaysExceeded = () => {
  const deptKey = selectedDept?.toLowerCase();
  const bidDeptEntry = horizontalData[0];

  const bidMandays = bidDeptEntry && deptKey in bidDeptEntry
    ? parseFloat(bidDeptEntry[deptKey])
    : 0;

  const row = assignedMandaysRef.current?.getData?.()?.[0] || {};

  const totalAssigned = Object.entries(row)
    .filter(([key, value]) => key !== 'key' && !isNaN(value))
    .reduce((sum, [, value]) => sum + parseFloat(value), 0);

  console.log("bidMandays", bidMandays);
  console.log("totalAssigned", totalAssigned);

  if (totalAssigned >= bidMandays) {
    Modal.error({
      title: "Mandays Limit Exceeded",
      content: `You cannot assign more mandays. Total assigned mandays (${totalAssigned}) have reached or exceeded the limit (${bidMandays}) for ${selectedDept}.`
    });
    return false;
  }

  return true;
};

const handleShotsExcelExport = async() =>{
  const workbook = new ExcelJS.Workbook();

    const dataSheet = workbook.addWorksheet("Main Shots Data");
     
    if (!columns.length || !data.length) return;

    const columnKeys = columns.map(col => col.dataIndex);

    if (data.length > 0) {
      console.log("data", data)
      // const headerRow = dataSheet.addRow(Object.keys(data[0]));
      const headerRow = dataSheet.addRow(columnKeys);
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

      // data.forEach((item) => {
      //   dataSheet.addRow(Object.values(item));
      // });

        data.forEach((row) => {
    const filteredRow = columnKeys.map((key) => row[key]);
    dataSheet.addRow(filteredRow);
  });

      dataSheet.columns.forEach((column) => {
        column.width = 20;
      });
    }
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "shots.xlsx");
}




return (
    <div className="shots_tab_container">
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
              htmlFor="shots_proj_dropdown"
              style={{
                marginRight: "5px",
                textAlign: "center",
                borderRadius: "5px",
              }}
            >
              Project:
            </label>
            <Dropdown overlay={<ShotsProjMenu projOptions={projOptions} handleProjClick={handleProjClick}/>} trigger={["click"]}>
              <Button style={{width:"130px"}} id="shots_proj_dropdown">
                {selectedProject || "Select an option"}
                {/* {selectedProject === "select" || !selectedProject ? "select" : selectedProject} */}
              </Button>
            </Dropdown>
          </div>
         <div style={{ marginLeft: "20px" }}>
            <label
              htmlFor="shots_dept_dropdown"
              style={{
                marginRight: "5px",
                textAlign: "center",
                borderRadius: "5px",
              }}
            >
              Select Dept:
            </label>
            <Dropdown overlay={<ShotsDeptMenu deptOptions={deptOptions} handleDeptClick={handleDeptClick}/>} trigger={["click"]}>
              <Button style={{width:"130px"}} id="shots_dept_dropdown">
                {selectedDept || "Select an Option"}
                {/* {selectedDept === "select" || !selectedDept? "select" : selectedDept} */}
              </Button>
            </Dropdown>
          </div>

          <div>
            <Button
              type="primary"
              onClick={handleShowTable}
              disabled={!selectedProject}
            >
              Show Table
            </Button>
          </div>

          <div
            style={{
              display: "flex",

              flexWrap: "wrap",
              gap: "10px",
              marginLeft: "auto",
            }}
          >
            <label htmlFor="field" style={{ marginTop: "8px" }}>
              Fields:
            </label>
            <Dropdown overlay={<FieldsMenu  selectedDept={selectedDept} handleFieldSelect={handleFieldSelect}  filteredData={filteredData}/>} trigger={["click"]}>
              <Button id="field" style={{ margin: "0px" }}>
                {selectedFieldLabel}
              </Button>
            </Dropdown>

            <Button
              style={{ margin: "0px" }}
              onClick={() => handleSelectArtist(selectedDept.toLowerCase())}
            >
              Select Artist
            </Button>
            <Button style={{ margin: "1px" }}  onClick={() => handleAssignSplitTask(selectedDept.toLowerCase())}>Assign split tasks</Button>
            <Button style={{ margin: "1px" }} onClick={()=> handleShotsExcelExport()}>Excel Export</Button>
          </div>
        
        </div>
      </div>
     

      {showTable && selectedProject && (
        <Spin spinning={loading}>
          {data.length === 0 ? (
            <Alert
              message="No Data"
              description={`No data available for ${selectedProject}.`}
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
               <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                 <Spin size="large" />
               </div>
               ) : (
                <div className="textarea_container">
                <TextArea
                  value={persistedText || "Click on a row to view details"}
                  rows={8}
                  readOnly
                 
                  style={{
                    marginBottom: "36px",
                    marginTop: "15px",
                    width: "100%",
                    fontSize: "14px",
                    whiteSpace: "pre",
                    fontFamily: "monospace",
                  }}
                   // onChange={handleTextAreaChange}
                />
                </div>
              )}
              </div>
              {columns.length>0 && data.length > 0 && (
                
                 <div className={`scrollable-table-wrapper ${columns.length > 0 && data.length > 0 ? 'rendered' : ''}`}>
                 
              <Table
                className="custom-table"
                columns={columns}
                dataSource={data}
                // rowKey="_id"
                // rowKey={(record) => record._id}
                rowKey={(record, index) => record._id || index}

                // rowKey={(record, index) => record.id || index}

                onChange={handleTableChange}
                // filteredValue={tableParams.filters}
                // sortOrder={tableParams.sorter?.order}
                // sortedInfo={tableParams.sorter}
                rowClassName="clickable-row"
                onRow={(record) => ({
                  onClick: () => handleRowClick(record),
                })}
                
                // pagination={tableParams.pagination}
                pagination={false}
              
                scroll={{ x: 'max-content', y: 'calc(100vh - 450px)' }}
                // scroll={{ x: 'max-content', y: '100%' }}
                sticky={{ offsetHeader: 0 }}
                // scroll={{ x: "max-content" }}
                // scroll={{ x: 2800, y: 400 }}
                // style={{ marginTop: "60px", border: "2px solid #ccc" }}
                style={{ border: "2px solid #ccc" }}
                bordered
              />
             
              </div>
             
               ) }
              <>
                <Modal
                  title="Select an Artist"  
                  visible={artistPopupVisible}
                  onCancel={() => 
                    setArtistPopupVisible(false)
                   
  // set
                  }
                  footer={null}
                  width={900}
                >



           {artistPopupVisible && persistedText &&
                (
                  <>
           <h1 style={{display:"flex", flexDirection:"row", 
              justifyContent:"center",alighItem:"center",fontSize:"14px"}}>Bid Mandays Table</h1>
          
                <Table

              columns={horizontalColumns}
              dataSource={horizontalData}
              pagination={false}
             
              bordered
                />

            <h1 style={{display:"flex", flexDirection:"row", 
              justifyContent:"center",alighItem:"center",fontSize:"14px"}}>Assigned Mandays Table</h1>
            
             
               <AssignedMandaysTable
                 ref={assignedMandaysRef}
                shotName={shotName}
                selectedDept={selectedDept}
                 filteredData={filteredData}
                ip_port={ip_port}
                 accessToken={accessToken}
                 refreshTrigger={refreshTrigger}
                />
              
                </>
            )    
            
            }
                <Radio.Group

                    onChange={(e) => setSelectedArtist(e.target.value)}
                    value={selectedArtist}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      marginTop:"24px",
                    }}
                  >
                    {selectedArtists.map((artist, index) => (
                      <Radio key={index} value={artist}>
                        {artist} 
                      </Radio>
                    ))}
                  </Radio.Group>
                  <div style={{ marginTop: 20, textAlign: "right" }}>
                    <Button
                      type="primary"
                      disabled={!selectedArtist}
                      onClick={()=>{
                       
                         if(!checkMandaysExceeded()) return;
                        
                        
                        
                        
                        handleAssignTask(selectedRowData,selectedArtist,setArtistPopupVisible,
                        selectedFieldLabel,selectedDept,user,accessToken,fetchData,setRefreshTrigger)}
                        }
                    >
                      Assign Task
                    </Button>
                  </div>

                </Modal>
              </>
         

         
           <Modal 
               title="Select  Artists"
               visible={assignSplitPopUp}
              onCancel={()=> setAssignSplitPopUp(false)}
             footer={null}
             width={1500}
             className= {`${darkTheme ? "dark-theme" : "light-theme"} split-Modal`}
           
            styles={{

              header: {
                backgroundColor: darkTheme ? "#121212" : "#f0fcea"
              },
              body: {
                height: 800,
                overflow: "auto", 
                display: "flex",
                backgroundColor: darkTheme ? "#121212" : "#f0fcea"
                 
          
              },
             
              content: {
                height: 900,
                backgroundColor: darkTheme ? "#121212":"#f0fcea"
              }
            }}
             >



          <div style={{ display: "flex", gap: "20px" }}>
          <div 
          style={{ flex: 1, borderRight: "1px solid #f0f0f0", paddingRight: "5px",height:"100%" ,width:"100%",margin:"5px"}}>


          <Card
            title={`${selectedDept || "Select Dept"} Employee List`}
             className="modal-checkbox-container"
            style={{
            flex: 1,
             height: "100%",
            width:"20vw",
            overflowY: "auto",
            display: "flex",
            
           flexDirection: "column",
          justifyContent: "flex-start",
         
          }}
          >



               <Checkbox.Group
                    onChange={(checkedValues) => setAssignSplitArtist(checkedValues)}
                    value={selectedAssignSplitArtist}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {selectedAssignSplitTaskArtists.map((assignArtist, index) => (
                      <Checkbox key={index} value={assignArtist}>
                        {assignArtist} 
                      </Checkbox>
                    ))}
                  </Checkbox.Group>

                   <div style={{margin:"11px",padding:"11px"}}>
                    <Button onClick={() => {
                     if (selectedAssignSplitArtist.length > 0) {
                       const initialData = {};
                       selectedAssignSplitArtist.forEach((artist) => {
                    //  initialData[artist] = assignSplitData?.[artist] || 0.1;
                    initialData[artist] = 0.0;
                    });

                  setAssignSplitData(initialData);
                  
                  setAssignSplitData(initialData);
                  setConfirmedAssignSplitArtist(selectedAssignSplitArtist);
                // setShowAssignSplitTable(true);


                setTimeout(() => {
                  setShowAssignSplitTable(true);
                }, 0);

                const total = Object.values(initialData).reduce(
                  (acc, curr) => acc + parseFloat(curr || 0),
                  0
                );
                setTotalMandays(parseFloat(total.toFixed(1))); 
               }
              }}>Next</Button>
                    </div>

                  </Card>
                  </div>    

        <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: "20px"}}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <label htmlFor="field" style={{ marginTop: "29px" }}>
              Fields:
            </label>
            <Dropdown overlay={<FieldsMenu  selectedDept={selectedDept} handleFieldSelect={handleWindowFieldSelect}  filteredData={filteredData}/>} trigger={["click"]}>
              <Button id="field" style={{ marginTop: "29px" }}>
                {selectedWindowFieldLabel || "Select a Field"}
              </Button>
            </Dropdown>
            </div>
            {assignSplitPopUp && persistedText &&
            <div>
            <h1 style={{display:"flex", flexDirection:"row", 
              justifyContent:"center",alighItem:"center",fontSize:"14px",margin:"4px"}}>Bid Mandays Table</h1>
          
            <Table

              columns={horizontalColumns}
              dataSource={horizontalData}
              pagination={false}
             
              bordered
            />

            <h1 style={{display:"flex", flexDirection:"row", 
              justifyContent:"center",alighItem:"center",fontSize:"14px",margin:"4px"}}>Assigned Mandays Table</h1>

             
              <AssignedMandaysTable
                ref={assignedMandaysRef}
                shotName={shotName}
                selectedDept={selectedDept}
                filteredData={filteredData}
                ip_port={ip_port}
                accessToken={accessToken}
                refreshTrigger={refreshTrigger}
  />
                

{showAssignSplitTable && (
   <>
    <Table
      style={{marginTop:"24px"}}
      columns={splitTableColumns}
      dataSource={splitTableData}
      pagination={false}
      rowKey={(record) => record.artist}
      rowClassName={() => 'hover-row'}
      width="80px"
      bordered
    />
    <div style={{ marginTop: "22px", fontWeight: "bold" }}>
    Total Mandays: {totalMandays.toFixed(1)}
  </div>

  <div style={{margin:"22px"}}>
    <Button onClick={async ()=> {



              if (!checkMandaysExceeded()) return;

              const result = await handleAssignSplitTasksMandaysClick(selectedRowData,selectedAssignSplitArtist,
                        selectedWindowFieldLabel,selectedDept,user,accessToken,splitTableData, fetchData, setRefreshTrigger,setAssignSplitPopUp,)
                        
                        if (result && result.status === 'success') {
                          message.success(result.message || "Tasks successfully assigned");
                        } else {
                          message.error(result.message || "Failed to assign tasks");
                        }
                        
                        
                       
                      }
                        }>Assign Tasks</Button>
  </div>


</>


)}
  </div> 
       
}
</div>
</div>
        </Modal>
            </div>
        )}
        </Spin>
      )}
    </div>
  );
};

export default Shots;




                 