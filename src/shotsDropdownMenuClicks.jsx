import {Menu, Input} from "antd";
import axios from "axios";
import {ip_port} from "./Configs"
import { useState } from "react";

export const ShotsProjMenu = ({handleProjClick, projOptions})=>{

  const [searchText, setSearchText] = useState("");

  const filteredOptions = projOptions.filter((option) =>
    option.toLowerCase().includes(searchText.toLowerCase())
  );

    return(
      <div>
      <Input
      placeholder="Search project"
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
      style={{ marginBottom: "8px",width:"128px" }}
    />
    <Menu
      onClick={handleProjClick}
      style={{ overflowY: "auto", maxHeight: "200px" }}
    >
      <Menu.Item key="select">select </Menu.Item>
      {filteredOptions.map((proj) => (
        <Menu.Item key={proj}>{proj}</Menu.Item>
      ))}
    </Menu>
    </div>
  )
}

export const ShotsDeptMenu = ({handleDeptClick, deptOptions})=>{
    return(
    <Menu
      onClick={handleDeptClick}
      style={{ overflowY: "auto", maxHeight: "200px" }}
    >
      <Menu.Item key="select">select</Menu.Item>
      {deptOptions.map((shot_header) => (
        <Menu.Item key={shot_header}>{shot_header}</Menu.Item>
      ))}
    </Menu>
  )
}


const handleDeptAllClick = async (accessToken) => {
  const controlsResponse = await axios.get(
    `http://${ip_port}/departments/`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
   
  ); 
  console.log("controlsResponse", controlsResponse.data)
  return controlsResponse.data;
  
}




export const ShotsTasksDeptMenu = ({handleTasksDeptClick, taskDeptOptions, accessToken, designation})=>{
  
  return(
  <Menu
  
    // onClick={handleTasksDeptClick}
    onClick={(e) => {
      if (e.key === "All"){
        handleDeptAllClick(accessToken);
        handleTasksDeptClick({key : "All"})
      }else{
        handleTasksDeptClick(e)
      }
    }}
    style={{ overflowY: "auto", maxHeight: "200px" }}
  >
    
    <Menu.Item key="select">select</Menu.Item>
    {((designation === "Supervisor" || designation === "Manager") &&
    <Menu.Item key="All">All</Menu.Item>
    )}
    {taskDeptOptions.map((shot_header) => (
      <Menu.Item key={shot_header}>{shot_header}</Menu.Item>
    ))}
  </Menu>
)
}



export const ShotsTasksProjMenu = ({handleTasksProjClick, taskProjOptions})=>{
  
  const [searchText, setSearchText] = useState("");

  const filteredOptions = taskProjOptions.filter((option) =>
    option.toLowerCase().includes(searchText.toLowerCase())
  );
  return(
    <div style={{ maxHeight: "250px",width:"140px", overflowY: "auto", padding: "5px" }}>
        <Input
        placeholder="Search project"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: "8px" }}
      />
  <Menu
    onClick={handleTasksProjClick}
    style={{ overflowY: "auto", maxHeight: "200px" }}
  >
    <Menu.Item key="select">select </Menu.Item>
    {/* {taskProjOptions.map((proj) => ( */}
    {filteredOptions.map((proj) => (
      <Menu.Item key={proj}>{proj}</Menu.Item>
    ))}
  </Menu>
 </div>
)
}


// export const FieldsMenu = ({selectedDept,handleFieldSelect,filteredData}) => {
//     const fieldOptions =
//     selectedDept && selectedDept !== "select"
//       ? filteredData[0]?.bid_micro[selectedDept] || []
//       : [];

//     return(
//     <Menu style={{ overflowY: "auto", maxHeight: "200px" }}   onClick={{handleFieldSelect}}>
       
//       {selectedDept && selectedDept != "select" && (
//         <Menu.Item
//         //   key={selectedDept}
//           key={selectedDept.toLowerCase()}
//         //   onClick={() => handleFieldSelect(selectedDept.toLowerCase())}
//         >
//           {" "}
//           {selectedDept.toLowerCase()}
//         </Menu.Item>
//       )}

//       {/* {selectedDept && selectedDept !== "select" ? (
//         (filteredData[0]?.bid_micro[selectedDept] || []).map((subColumn) => (
//           <Menu.Item
//             key={subColumn}
//             onClick={() => handleFieldSelect(subColumn)}
//           >
//             {subColumn}
//           </Menu.Item>
//         )) */}

// {fieldOptions.length > 0 ? (
//         fieldOptions.map((subColumn) => (
//           <Menu.Item key={subColumn}>{subColumn}</Menu.Item>
//         ))
//       ) : (
//         <Menu.Item disabled>No Fields Available</Menu.Item>
//       )}
//     </Menu>
//   )
// }



export const FieldsMenu = ({ selectedDept, handleFieldSelect, filteredData }) => {
  const menuItems = [];

  // Add the department name as the first item (optional)
  if (selectedDept && selectedDept !== "select") {
    menuItems.push(
      <Menu.Item key={selectedDept.toLowerCase()}>
        {selectedDept.toLowerCase()}
      </Menu.Item>
    );

    // Add subfields
    const subFields = filteredData[0]?.bid_micro[selectedDept] || [];
    subFields.forEach((subColumn) => {
      menuItems.push(<Menu.Item key={subColumn}>{subColumn}</Menu.Item>);
    });
  } else {
    menuItems.push(<Menu.Item disabled key="no_fields">No Fields Available</Menu.Item>);
  }

  return (
    <Menu
      style={{ overflowY: "auto", maxHeight: "200px" }}
      onClick={handleFieldSelect} // ✅ Correct way to handle selection
    >
      {menuItems}
    </Menu>
  );
};
