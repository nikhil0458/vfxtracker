import React, { useEffect, useRef, useState } from "react";
import { Table, Button, Row, Col, Dropdown, Menu, Input, message } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { ip_port } from "./Configs";
import axios from "axios";
import ExcelJS from "exceljs";
// import { saveAs } from "file-saver";
import "./Testing.css";
import { Resizable } from "react-resizable";
import "react-resizable/css/styles.css";



const ResizableTitle = (props) => {
  const { onResize, width, ...restProps } = props;
  if (!width) return <th {...restProps} />;

  return (
    <Resizable
      width={width}
      height={0}
      handle={
        <span
          className="react-resizable-handle"
          onClick={(e) => e.stopPropagation()}
        />
      }
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};

// Put this above TestProjectBidSummary in Testing.jsx
const NestedTable = ({ record }) => {
  const [nestedData, setNestedData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNested = async () => {
      try {
        const response = await fetchNestedData(record.proj, record.shot);
        console.log("ResponseOfNestedApiData", response);

        setNestedData(response);
      } catch (err) {
        console.error("Error fetching nested data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNested();
  }, [record.proj, record.shot]);

  const nestedColumns = ["mode_logs"].map((key) => ({
    title: key.charAt(0).toUpperCase() + key.slice(1),
    dataIndex: key,
    key,
    width: 80,
    // render: (text) => {
    //   try {
    //     const parsed = JSON.parse(text);
    //     return <pre>{JSON.stringify(parsed, null, 2)}</pre>;
    //   } catch (err) {
    //     return text;
    //   }
    // },
    // render: (text) => {
    //   try {
    //     const parsed = JSON.parse(text);
    //     return (
    //       <ul style={{ paddingLeft: 16 }}>
    //         {parsed.map((item, idx) => (
    //           <li key={idx}>
    //             {Object.entries(item).map(([k, v]) => (
    //               <span key={k}>
    //                 <b>{k}</b>: {String(v)}{" "}
    //               </span>
    //             ))}
    //           </li>
    //         ))}
    //       </ul>
    //     );
    //   } catch (err) {
    //     return text;
    //   }
    // },

    render: (text) => {
      try {
        const fixed = text.replace(/'/g, '"');
        const parsed = JSON.parse(fixed);

        return (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Mode</th>
                <th>Start</th>
                <th>End</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {parsed.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.mode}</td>
                  <td>{item.start}</td>
                  <td>{item.end}</td>
                  <td>{item.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      } catch (err) {
        return text;
      }
    },
  }));

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        margin: "12px 0",
        width: "50%",
      }}
    >
      <Table
        bordered
        components={{
          header: { cell: ResizableTitle },
        }}
        columns={nestedColumns}
        dataSource={nestedData}
        loading={loading}
        pagination={false}
        size="small"
        rowKey={(r, idx) => r.id || idx}
        style={{ width: "80%" }}
        scroll={{ x: "max-content", y: 300 }}
        // style={{ width: "fit-content" }}
      />
    </div>
  );
};

let dateToUse = "2025-05-20";
const fetchNestedData = async () => {
  try {
    const response = await axios.get(
      `http://${ip_port}/login_logs_with_offline_users/?date=${dateToUse}`
    );
    const data = response.data;
    console.log("ResponseOfNestedApiData", data);

    return response.data || [];
  } catch (error) {
    message.error("Failed to fetch nested data.");
    console.error(error);
    return [];
  }
};

const TestProjectBidSummary = () => {
  const [projectCodes, setProjectCodes] = useState([]);
  const [selectedBidProjectOption, setSelectedBidProjectOption] = useState("");
  const [displayedOption, setDisplayedOption] = useState("");
  const [tableData, setTableData] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isReportVisible, setIsReportVisible] = useState(false);
  const [filterOfFilterData, isFilterOfFilterData] = useState([]);
  const [searchText, setSearchText] = useState("");
  // const searchInput = useRef(null);

  useEffect(() => {
    const fetchAndSetProjectCodes = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await axios.get(`http://${ip_port}/projects_list/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setProjectCodes(response.data || []);
      } catch (error) {
        message.error("Failed to fetch project codes.");
        console.error(error);
      }
    };

    fetchAndSetProjectCodes();
  }, []);

  const generateFilters = (data, key) => {
    const uniqueValues = [...new Set(data.map((item) => item[key]))];
    return uniqueValues.map((value) => ({ text: value, value }));
  };

  useEffect(() => {
    console.log("filterOffiltersData-Length", filterOfFilterData);
    // if (Array.isArray(filterOfFilterData) && filterOfFilterData.length > 0) {
    if (filterOfFilterData.length > 0) {
      console.log("filterOfFilterData", filterOfFilterData);
      const cols = Object.keys(filterOfFilterData[0]).map((key) => ({
        title: key.charAt(0).toUpperCase() + key.slice(1),
        dataIndex: key,
        key,
        filters: generateFilters(filterOfFilterData, key),

        // filters: generateFilters(data, key),
        onFilter: (value, record) => record[key] === value,

        sorter: (a, b) => {
          if (typeof a[key] === "number") return a[key] - b[key];
          if (typeof a[key] === "string") return a[key].localeCompare(b[key]);
          return 0;
        },
        width: 150,
      }));
      setTableColumns(cols);
    }
  }, [filterOfFilterData]);

  // let dateToUse="2025-05-20"

  // const fetchNestedData = async () => {
  //   try {
  //     const response = await axios.get(`http://${ip_port}/login_logs_with_offline_users/?date=${dateToUse}`

  //     );
  //     const data = response.data
  //     console.log("ResponseOfNestedApiData",data);

  //     return response.data || [];
  //   } catch (error) {
  //     message.error("Failed to fetch nested data.");
  //     console.error(error);
  //     return [];
  //   }
  // };

  // const requiredkeys=["proj","scene","shot","status","mandays","mode_logs"]

  const fetchReportData = async (projectCode) => {
    try {
      const response = await axios.get(`http://${ip_port}/bid_summary/`, {
        params: { proj: projectCode },
      });

      const data = response.data;

      if (data.length > 0) {
        const columns = Object.keys(data[0]).map((key, index) => ({
          title: key.charAt(0).toUpperCase() + key.slice(1),
          dataIndex: key,
          key: key,
          width: 150,
          // filters:[
          //   ...Array.from(new Set(data.map((item)=>item[key]))).map(
          //     (value)=>({
          //        text:value,
          //        value:value,
          //     })
          //   ),
          // ],
          // filters: generateFilters(filterOfFilterData, key),
          filters: generateFilters(data, key),
          filterSearch: true,
          onFilter: (value, record) => record[key] === value,

          sorter: (a, b) => {
            if (typeof a[key] === "number") return a[key] - b[key];
            if (typeof a[key] === "string") return a[key].localeCompare(b[key]);
            return 0;
          },
        }));

        setTableData(data);
        isFilterOfFilterData(data);
        setTableColumns(columns);
        setIsReportVisible(true);
        setDisplayedOption(projectCode);
      } else {
        setTableColumns([]);
        setTableData([]);
        setIsReportVisible(false);
        message.info("No data available for the selected project.");
      }
    } catch (error) {
      message.error("Failed to fetch report data.");
      console.error(error);
    }
  };

  const handleShowReport = async () => {
    if (selectedBidProjectOption) {
      setLoading(true);
      try {
        await fetchReportData(selectedBidProjectOption);
      } finally {
        setLoading(false);
      }
    } else {
      message.warning("Please select a project first.");
    }
  };

  const handleMenuClick = ({ key }) => {
    setSelectedBidProjectOption(key);
    setTableData([]);
    setTableColumns([]);
    setIsReportVisible(false);
  };

  const filteredOptions = projectCodes.filter((option) =>
    option.toLowerCase().includes(searchText.toLowerCase())
  );

  const menu = (
    <div>
      <Input
        placeholder="Search project"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: "8px", width: "150px" }}
      />
      <Menu
        style={{ maxHeight: "200px", overflowY: "auto" }}
        onClick={handleMenuClick}
      >
        {filteredOptions.map((code) => (
          <Menu.Item key={code}>{code}</Menu.Item>
        ))}
      </Menu>
    </div>
  );

  const handleResize =
    (index) =>
    (e, { size }) => {
      const nextCols = [...tableColumns];
      nextCols[index] = { ...nextCols[index], width: size.width };
      setTableColumns(nextCols);
    };

  const mergedColumns = tableColumns.map((col, index) => ({
    ...col,
    onHeaderCell: (column) => ({
      width: column.width,
      onResize: handleResize(index),
    }),
  }));

  const expandedRowRender = (record) => {
    //  const NestedTable =({record}) => {
    //     const [nestedData, setNestedData] = useState([]);
    //     const [loading, setLoading] = useState(true);
    // Required keys for nested table
    // const nestedKeys = ["proj","shot","status","mode_logs"];
    // useEffect(() => {
    //   const loadNested = async () => {
    //     setLoading(true);
    //     const data = await fetchNestedData(record.id);
    //     setNestedData(data);
    //     setLoading(false);
    //   };
    //   loadNested();
    // }, [record.id]);
    // useEffect(() => {
    //   const fetchNested = async () => {
    //     try {
    //       const response = await fetchNestedData(record.proj, record.shot);
    //       console.log("ResponseOfNestedApiData", response);
    //       setNestedData(response);
    //     } catch (err) {
    //       console.error("Error fetching nested data:", err);
    //     } finally {
    //       setLoading(false);
    //     }
    //   };
    //   fetchNested();
    // }, [record.proj, record.shot]);
    // const nestedColumns = nestedKeys.map((key) => ({
    //   title: key.charAt(0).toUpperCase() + key.slice(1),
    //   dataIndex: key,
    //   key,
    //   width: 150,
    // }));
    // const nestedColumns = ["proj", "shot", "status", "mode_logs"].map((key) => ({
    //   title: key.charAt(0).toUpperCase() + key.slice(1),
    //   dataIndex: key,
    //   key,
    //   width: 150,
    // }));
    //     return (
    //       <Table
    //       bordered
    //       components={{
    //         header: { cell: ResizableTitle },
    //       }}
    //       columns={nestedColumns}
    //         dataSource={nestedData}
    //         pagination={false}
    //         size="small"
    //         // rowKey="id"
    //         rowKey="{(r, idx) => r.id || idx}"
    //       />
    //     );
    //   };
  };

  const handleTableChange = (pagination, filters, sorter, extra) => {
    isFilterOfFilterData(extra.currentDataSource || []);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Row
          justify="center"
          gutter={16}
          style={{ marginBottom: 16, marginRight: 16 }}
        >
          <Col>
            <Dropdown overlay={menu} trigger={["click"]}>
              <Button>
                {selectedBidProjectOption || "Select a project"}{" "}
                <DownOutlined />
              </Button>
            </Dropdown>
          </Col>
        </Row>

        <Row justify="center" style={{ marginBottom: 16 }}>
          <Col>
            <Button
              type="primary"
              onClick={handleShowReport}
              disabled={!selectedBidProjectOption}
            >
              Show Report
            </Button>
          </Col>
        </Row>
      </div>

      <Row justify="center" style={{ marginTop: 24 }}>
        <Col span={24}>
          {selectedBidProjectOption && displayedOption && isReportVisible && (
            <div className="scrollable-table-wrapper">
              <Table
                bordered
                components={{
                  header: { cell: ResizableTitle },
                }}
                className="custom-table"
                dataSource={tableData}
                // columns={tableColumns}
                columns={mergedColumns}
                loading={loading}
                pagination={{ pageSize: 10 }}
                scroll={{ x: "max-content", y: "calc(100vh - 450px)" }}
                sticky={{ offsetHeader: 0 }}
                onChange={handleTableChange}
                rowKey={(record) =>
                  record.id || record.key || JSON.stringify(record)
                }
                expandable={{
                  expandedRowRender: (record) => (
                    <div
                      style={{
                        maxHeight: "500px",
                        overflowY: "auto",
                        overflowX: "auto",
                        // background: "#fafafa",
                        padding: "6px",
                        margin: "18px",
                      }}
                    >
                      <NestedTable record={record} />
                    </div>
                  ),

                  rowExpandable: (record) => Object.keys(record).length > 0,

                  // rowExpandable: (record) => Object.keys(record).length > 0,
                  // rowExpandable: (record) => !!record.id,
                  // rowExpandable:(record)=> <NestedTable record={record}/>,
                }}
              />
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default TestProjectBidSummary;

// import React from 'react';
// import { AgGridReact } from 'ag-grid-react';

// import 'ag-grid-community/styles/ag-grid.css';
// import 'ag-grid-community/styles/ag-theme-alpine.css';

// const columnDefs = [
//   { field: 'category', rowGroup: true, hide: true },
//   { field: 'type', pinned: 'left' },
//   { field: 'name', pinned: 'left' },
//   { field: 'email', pinned: 'left' },
//   { field: 'department', pinned: 'left' },
//   { field: 'type', pinned: 'left' },

//   { field: 'quantity', aggFunc: 'sum' },

//    {  field: "mandays"},
//   {   field:"hours"},
//    {   field:"assigned_by"},
//     {  field:"a_start_date"},
//     { field: "a_end_date"},
//     {  field: "status"},
//      {  field: "media_path"},
//      {   field: "hours_spent"},
//     {   field:"description"},
//     {  field: "review"},
//     {  field: "artist_comment"},
//     { field: "supervisor_comment"},
//     {  field:  "team_leader_comment"},
//      { field: "created_at"},
//      {field:"a_i_status"},
//      {field:  "target"},
//       { field: "reel"},
//       {field:"priority"},

// ];

// const rowData = [
//     { category: 'Fruit', type: 'A', quantity: 100, name: "Faythe", email: "faythe@example.com", department: "Finance", mandays: 0.5,
//             hours: "03:45:00",
//            assigned_by: "3102",
//            a_start_date: "2024-02-21",
//           a_end_date: null,
//            status: "DONE",
//           media_path: "_",
//             hours_spent: "03:03:00",
//            description: "_",
//            review: "_",
//             artist_comment: "_",
//              supervisor_comment: "_",
//             team_leader_comment: "_",
//            created_at: {
//               "$date": "2024-02-21T11:34:09.473Z"
//            },
//            a_i_status: "A",
//           target: "MET",
//             reel: "0",
//              priority: 1,
//              type: null},

//     { category: 'Fruit', type: 'O', quantity: 80, name: "Grace", email: "grace@example.com", department: "Engineering",
//        mandays:0.6,
//        hours:"04:46:00",
//        assigned_by:"3056",
//        a_start_date:"2025-02-21",
//        a_end_date:null,
//        status:"DONE",
//        media_path:"_",
//        hours_spent:"04:04:00",
//        description:"_",
//        review:"_",
//        artist_comment:"_",
//        supervisor_comment:"_",
//        team_leader_comment:"_",
//        reel:"0",
//        priority:"1",
//        type:null,
//        target:"MET",
//        a_i_status:"A",
//        created_at:{
//      "$date":"2025-07-016T04:07:09.473Z"
//        }

//      },

//     { category: 'Vegetable', type: 'C', quantity: 60,name: "Judy", email: "judy@example.com", department: "HR",
//       mandays:"0.6",
//       hours:"06:04:00",
//       assigned_by:"4692",
//       a_start_date:"",
//       a_end_date:"",
//       status:"YTS",
//       media_path:"",
//       hours_spent:"04:04:00",
//       description:"null",
//       review:"1",
//       artist_comment:"_",
//       supervisor_comment:"_",
//       team_leader_comment:"_",
//       reel:"0",
//       priority:"1",
//       created_at:{
//          "$date":"2025-07-18T04:02:06.473Z"
//       },

//       target:"MET",
//       type:null,
//      a_i_status:"A",

//      },

//   ];

// const  Testing = ()=> {

//   return (

//     <div className="ag-theme-alpine" style={{ height: 400, width:"100%", backgroundColor:"lightgray", borderRadius:"8px" }}>

//       <AgGridReact

//         rowData={rowData}
//         columnDefs={columnDefs}

//         groupIncludeFooter={true}
//         animateRows={true}
//         defaultColDef={{
//         sortable: true,
//         filter: true,
//         resizable:true,
//         width:"100%",

//         }}
//       />
//     </div>

//   );
// }

// export default Testing;

// // {
// //     "_id": {
// //       "$oid": "65d5dfb168314062ce3ccc2e"
// //     },
// //     "proj": "AOA",
// //     "scene": "AOA_R3_SG2",
// //     "shot": "AOA_R3_SG2_SHT_05",
// //     "thumbnail": "T:/all_projects/production/PARROTManagementTool/VFX_PARROT/thumbnails/AOA/AOA_R3_SG2_SHT_05.jpeg",
// //     "frames": 150,
// //     "duration": "00:00:06:06",
// //     "exr": "\\\\chandralok\\projects\\AOA\\00_Inputs\\01_For_Sorting\\Song\\FROM_DD_DI_17022024\\01_BATCH_01_17022024\\SONG_02\\AOA_R3_SG2_SHT_05",
// //     "sow": "_",
// //     "cgi_character": "_",
// //     "cgi_creature": "_",
// //     "cgi_asset": "_",
// //     "task_name": "AOA_R3_SG2_SHT_05_roto_3099",
// //     "artist_id": "3099",
// //     "artist_name": "Sh",
// //     "department": "roto",
// //     "field": "roto",
// //     "mandays": 0.5,
// //     "hours": "03:45:00",
// //     "assigned_by": "3102",
// //     "a_start_date": "2024-02-21",
// //     "a_end_date": null,
// //     "status": "DONE",
// //     "media_path": "_",
// //     "hours_spent": "03:03:00",
// //     "description": "_",
// //     "review": "_",
// //     "artist_comment": "_",
// //     "supervisor_comment": "_",
// //     "team_leader_comment": "_",
// //     "created_at": {
// //       "$date": "2024-02-21T11:34:09.473Z"
// //     },
// //     "a_i_status": "A",
// //     "target": "MET",
// //     "reel": "0",
// //     "priority": null,
// //     "type": null
// //   }

// // import * as React from 'react';
// // import Box from '@mui/material/Box';
// // import { DataGridPro } from '@mui/x-data-grid-pro';
// // import { useDemoData } from '@mui/x-data-grid-generator';

// // export default function DataGridProDemo() {
// //   const { data, loading } = useDemoData({
// //     dataSet: 'Commodity',
// //     rowLength: 100000,
// //     editable: true,
// //   });

// //   return (
// //     <Box sx={{ height: 520, width: '100%' }}>
// //       <DataGridPro
// //         {...data}
// //         loading={loading}
// //         rowHeight={38}
// //         checkboxSelection
// //         disableRowSelectionOnClick
// //       />
// //     </Box>
// //   );
// // }

// const logs=[{proj:"xyz",shot:"shot1",status:"wip",start:"s_time"}]

// import React from 'react';
// import { DownOutlined } from '@ant-design/icons';
// import { Badge, Dropdown, Space, Table } from 'antd';
// const items = [
//   { key: '1', label: 'Action 1' },
//   { key: '2', label: 'Action 2' },
// ];
// const expandDataSource = Array.from({ length: 3 }).map((_, i) => ({
//   key: i.toString(),
//   date: '2014-12-24 23:12:00',
//   name: 'This is production name',
//   upgradeNum: 'Upgraded: 56',
// }));
// const dataSource = Array.from({ length: 3 }).map((_, i) => ({
//   key: i.toString(),
//   name: 'Screen',
//   platform: 'iOS',
//   version: '10.3.4.5654',
//   upgradeNum: 500,
//   creator: 'Jack',
//   createdAt: '2014-12-24 23:12:00',
// }));
// const expandColumns = [
//   { title: 'Date', dataIndex: 'date', key: 'date' },
//   { title: 'Name', dataIndex: 'name', key: 'name' },
//   {
//     title: 'Status',
//     key: 'state',
//     render: () => <Badge status="success" text="Finished" />,
//   },
//   { title: 'Upgrade Status', dataIndex: 'upgradeNum', key: 'upgradeNum' },
//   {
//     title: 'Action',
//     key: 'operation',
//     render: () => (
//       <Space size="middle">
//         <a>Pause</a>
//         <a>Stop</a>
//         <Dropdown menu={{ items }}>
//           <a>
//             More <DownOutlined />
//           </a>
//         </Dropdown>
//       </Space>
//     ),
//   },
// ];
// const columns = [
//   { title: 'Name', dataIndex: 'name', key: 'name' },
//   { title: 'Platform', dataIndex: 'platform', key: 'platform' },
//   { title: 'Version', dataIndex: 'version', key: 'version' },
//   { title: 'Upgraded', dataIndex: 'upgradeNum', key: 'upgradeNum' },
//   { title: 'Creator', dataIndex: 'creator', key: 'creator' },
//   { title: 'Date', dataIndex: 'createdAt', key: 'createdAt' },
//   { title: 'Action', key: 'operation', render: () => <a>Publish</a> },
// ];
// const expandedRowRender = () => (
//   <Table columns={expandColumns} dataSource={expandDataSource} pagination={false} />
// );
// const App = () => (
//   <>
//     <Table
//       columns={columns}
//       expandable={{ expandedRowRender, defaultExpandedRowKeys: ['0'] }}
//       dataSource={dataSource}
//     />
//     {/* <Table
//       columns={columns}
//       expandable={{ expandedRowRender, defaultExpandedRowKeys: ['0'] }}
//       dataSource={dataSource}
//       size="middle" */}
//     {/* /> */}
//     {/* <Table
//       columns={columns}
//       expandable={{ expandedRowRender, defaultExpandedRowKeys: ['0'] }}
//       dataSource={dataSource}
//       size="small"
//     /> */}
//   </>
// );
// export default App;

// import React, { useState, useEffect, useRef } from "react";
// import { Dropdown, Menu, Button, Table, message, Row, Col, Flex ,Input} from "antd";
// import { DownOutlined, SearchOutlined } from "@ant-design/icons";
// import { ip_port } from "./Configs";
// import { fetchProjectCodes } from "./utils";
// import axios from "axios";
// import "./ProjectBidSummary.css";

// import ExcelJS from "exceljs";
// import { saveAs } from "file-saver";

// const TestProjectBidSummary = () => {
//   const [projectCodes, setProjectCodes] = useState([]);
//   const [selectedBidProjectOption, setSelectedBidProjectOption] = useState("");
//   const [displayedOption, setDisplayedOption] = useState("");
//   const [tableData, setTableData] = useState([]);
//   const [tableColumns, setTableColumns] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [isReportVisible, setIsReportVisible] = useState(false);
//   const searchInput = useRef(null);

//   const [searchText, setSearchText] = useState("");

//   useEffect(() => {
//     const fetchAndSetProjectCodes = async () => {
//       try {
//         const accessToken = localStorage.getItem("accessToken");
//         const codes = await fetchProjectCodes(accessToken);
//         setProjectCodes(codes);
//       } catch (error) {
//         message.error("Failed to fetch project codes.");
//         console.error(error);
//       }
//     };

//     fetchAndSetProjectCodes();

//     const savedSelectedBidProjectOption = localStorage.getItem(
//       "selectedBidProjectOption"
//     );
//     const savedDisplayedOption = localStorage.getItem("displayedOption");
//     const savedTableData = localStorage.getItem("tablebidsummaryData");
//     const savedTableColumns = localStorage.getItem("tableColumns");
//     const savedIsReportVisible = localStorage.getItem("isReportVisible");

//     if (savedSelectedBidProjectOption)
//       setSelectedBidProjectOption(savedSelectedBidProjectOption);
//     if (savedDisplayedOption) setDisplayedOption(savedDisplayedOption);

//     if (savedTableData && savedTableColumns) {
//       try {
//         const parsedData = JSON.parse(savedTableData);
//         const parsedColumns = JSON.parse(savedTableColumns);
//         if (
//           Array.isArray(parsedData) &&
//           Array.isArray(parsedColumns) &&
//           parsedData.length > 0
//         ) {
//           setTableData(parsedData);
//           setTableColumns(parsedColumns);
//           setIsReportVisible(savedIsReportVisible === "true");
//         }
//       } catch (error) {
//         console.error("Error parsing table data from localStorage:", error);
//       }
//     }
//   }, []);

//   const fetchReportData = async (projectCode) => {
//     try {
//       const response = await axios.get(`http://${ip_port}/bid_summary/`, {
//         params: { proj: projectCode },
//       });

//       const data = response.data;

//       if (data.length > 0) {
//         const totalRows = data.length;

//         const columns = Object.keys(data[0]).map((key, index) => ({
//           title: key.charAt(0).toUpperCase() + key.slice(1),
//           dataIndex: key,

//           key: key,

//           fixed: index < 4,
//           filters: [
//             ...Array.from(new Set(data.map((item) => item[key]))).map(
//               (value) => ({
//                 text: value,
//                 value: value,
//               })
//             ),
//           ],
//           filterSearch: true,
//           onFilter: (value, record) => record[key] === value,
//           sorter: (a, b) => {
//             if (typeof a[key] === "number") {
//               return a[key] - b[key];
//             } else if (typeof a[key] === "string") {
//               return a[key].localeCompare(b[key]);
//             }
//             return 0;
//           },
//         }));

//         console.log("Fetched Data:", data);
//         console.log("Generated Columns:", columns);
//         setTableData(data);

//         setTableColumns(columns);

//         setIsReportVisible(true);
//         setDisplayedOption(projectCode);

//         localStorage.setItem("tablebidsummaryData", JSON.stringify(data));
//         localStorage.setItem("tableColumns", JSON.stringify(columns));
//         localStorage.setItem("isReportVisible", true);
//         localStorage.setItem("displayedOption", projectCode);
//       } else {
//         setTableColumns([]);
//         setTableData([]);
//         setIsReportVisible(false);
//         localStorage.setItem("isReportVisible", false);
//         message.info("No data available for the selected project.");
//       }
//     } catch (error) {
//       message.error("Failed to fetch report data.");
//       console.error(error);
//     }
//   };

//   const handleShowReport = async () => {
//     if (selectedBidProjectOption) {
//       setLoading(true);
//       try {
//         await fetchReportData(selectedBidProjectOption);
//         setDisplayedOption(selectedBidProjectOption);
//       } catch {
//       } finally {
//         setLoading(false);
//       }
//     } else {
//       message.warning("Please select a project first.");
//     }
//   };

//   const handleMenuClick = ({ key }) => {
//     setSelectedBidProjectOption(key);

//     localStorage.setItem("selectedBidProjectOption", key);

//     setTableData([]);
//     setTableColumns([]);
//     setIsReportVisible(false);
//   };
//   const filteredOptions = projectCodes.filter((option) =>
//     option.toLowerCase().includes(searchText.toLowerCase())
//   );
//   const menu = (
//     <div>
//     <Input
//       placeholder="Search project"
//       value={searchText}
//       onChange={(e)=> setSearchText(e.target.value)}
//       style={{marginBottom:"8px", width:"150px"}}
//     />
//     <Menu
//       style={{
//         maxHeight: "200px",
//         overflowY: "auto",
//       }}
//       onClick={handleMenuClick}
//     >
//       {filteredOptions.map((code) => (
//         <Menu.Item key={code}>{code}</Menu.Item>
//       ))}
//     </Menu>
//     </div>
//   );

//   const handleDownload = async () => {
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Data");

//     const headerRow = worksheet.addRow(Object.keys(tableData[0]));
//     headerRow.height = 20;
//     headerRow.eachCell((cell) => {
//       cell.font = {
//         name: "Calibri",
//         bold: false,
//         size: 12,
//         color: { argb: "FFFFFF" },
//       };
//       // cell.font = { fontStyle:"normal", fontSize:"20px", bold: false };
//       cell.fill = {
//         type: "pattern",
//         pattern: "solid",
//         fgColor: { argb: "4F81BD" },
//       };
//       cell.alignment = { horizontal: "left", vertical: "middle" };
//       cell.border = {
//         top: { style: "thin" },
//         left: { style: "thin" },
//         bottom: { style: "thin" },
//         right: { style: "thin" },
//       };
//     });

//     tableData.forEach((item) => {
//       worksheet.addRow(Object.values(item));
//     });

//     worksheet.columns.forEach((column) => {
//       column.width = 20;
//     });

//     const buffer = await workbook.xlsx.writeBuffer();
//     const blob = new Blob([buffer], { type: "application/octet-stream" });
//     saveAs(blob, "ProjectBidSummary.xlsx");
//   };

//   const getStoredTableState = () => {
//     const storedState = localStorage.getItem("projectBidSummaryTableState");
//     return storedState ? JSON.parse(storedState) : {};
//   };

//   const storedState = getStoredTableState();

//   const [tableParams, setTableParams] = useState({
//     pagination: storedState.pagination || { pageSize: 10 },
//     filters: storedState.filters || {},
//     sorter: storedState.sorter || {},
//   });
//   const enhancedProjectBidSummaryColumns = tableColumns.map((col) => ({
//     ...col,
//     sorter: (a, b) => (a[col.dataIndex] > b[col.dataIndex] ? 1 : -1),
//     sortOrder:
//       tableParams.sorter?.columnKey === col.dataIndex
//         ? tableParams.sorter.order
//         : null,
//     filters: [...new Set(tableData.map((item) => item[col.dataIndex]))].map(
//       (value) => ({
//         text: value,
//         value,
//       })
//     ),
//     filteredValue: tableParams.filters?.[col.dataIndex] || null,
//     onFilter: (value, record) => record[col.dataIndex] === value,
//     width:150,
//   }));

//   const handleTableChange = (pagination, filters, sorter) => {
//     const newState = {
//       pagination,
//       filters,
//       sorter: sorter.columnKey ? sorter : {},
//     };
//     setTableParams(newState);
//     localStorage.setItem(
//       "projectBidSummaryTableState",
//       JSON.stringify(newState)
//     );
//   };

//   return (
//     <div>
//       <div
//         style={{
//           display: "flex",
//           flexDirection: "row",
//           justifyContent: "center",
//           alignItems: "center",
//         }}
//       >
//         <Row
//           justify="center"
//           gutter={16}
//           style={{ marginBottom: 16, marginRight: 16 }}
//         >
//           <Col>
//             <Dropdown overlay={menu} trigger={["click"]}>
//               <Button>
//                 {selectedBidProjectOption || "Select a project"}{" "}
//                 <DownOutlined />
//               </Button>
//             </Dropdown>
//           </Col>
//         </Row>
//         <Row justify="center" style={{ marginBottom: 16 }}>
//           <Col>
//             <Button
//               type="primary"
//               onClick={handleShowReport}
//               disabled={!selectedBidProjectOption}
//             >
//               Show Report
//             </Button>
//           </Col>

//           {isReportVisible && (
//             <Col>
//               <Button
//                 style={{ marginLeft: 18 }}
//                 type="primary"
//                 disabled={!selectedBidProjectOption}
//                 onClick={handleDownload}
//               >
//                 Export Excel
//               </Button>
//             </Col>
//           )}
//         </Row>
//       </div>
//       <Row justify="center" style={{ marginTop: 24 }}>
//         <Col span={24}>

//           {selectedBidProjectOption && displayedOption && isReportVisible && (
//               <div className="scrollable-table-wrapper">
//             <Table
//               className="custom-table"
//               dataSource={tableData}
//               // scroll={{ x: "auto" }}
//               // scroll={{x: "max-content", y : 400}}
//               columns={enhancedProjectBidSummaryColumns}
//               loading={loading}
//               onChange={handleTableChange}
//               pagination={false}
//               scroll={{ x: 'max-content', y: 'calc(100vh - 450px)' }}
//               // filteredValue={tableParams.filters}
//               // sortOrder={tableParams.sorter?.order}
//               // sortedInfo={tableParams.sorter}
//               // sticky
//               sticky={{ offsetHeader: 0 }}
//               rowKey={(record) =>
//                 record.id || record.key || JSON.stringify(record)
//               }
//               expandable={{
//                 expandedRowRender: (record) => {
//                   // Define nested columns
//                   const nestedColumns = [
//                     { title: "Detail Key", dataIndex: "key", key: "key" },
//                     { title: "Detail Value", dataIndex: "value", key: "value" },
//                   ];

//                   // Example: convert nested object properties into key/value rows
//                   const nestedData = Object.entries(record).map(([key, value], index) => ({
//                     key: index,
//                     keyName: key,
//                     value: typeof value === "object" ? JSON.stringify(value) : value,
//                   }));

//                   return (
//                     <Table
//                       columns={[
//                         { title: "Field", dataIndex: "keyName", key: "keyName" },
//                         { title: "Value", dataIndex: "value", key: "value" },
//                       ]}
//                       dataSource={nestedData}
//                       pagination={false}
//                       size="small"
//                     />
//                   );
//                 },
//                 rowExpandable: (record) => Object.keys(record).length > 0,

//               }}
//             />
//             </div>
//           )}
//         </Col>
//       </Row>
//     </div>
//   );
// };

// export default TestProjectBidSummary;
