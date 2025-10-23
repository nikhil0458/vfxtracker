import React, { useState } from "react"
import {Menu, Input } from "antd";


export const AssetsTasksProjMenu = ({handleTasksAssetProjClick, taskAssetProjOptions})=>{

  const [searchText, setSearchText] = useState("");
    
  const filteredOptions = taskAssetProjOptions.filter((proj) =>
    proj.toLowerCase().includes(searchText.toLowerCase())
  );
     return(
      <div>
<Input
        placeholder="Search project"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: "8px" , width:"140px"}}
      />
    <Menu
      onClick={handleTasksAssetProjClick}
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
  export const handleDeptAssetAllClick = async (accessToken) => {
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
  
  
export const AssetsTasksDeptMenu = ({handleAssetTasksDeptClick ,assetTaskDeptOptions, accessToken, designation})=>{
    return(
    <Menu
    
      // onClick={handleTasksDeptClick}
      onClick={(e) => {
        if (e.key === "All"){
          handleDeptAssetAllClick(accessToken);
          handleAssetTasksDeptClick ({key : "All"})
        }else{
            handleAssetTasksDeptClick (e)
        }
      }}
      style={{ overflowY: "auto", maxHeight: "200px" }}
    >
      
      <Menu.Item key="select">select</Menu.Item>
      {((designation === "Supervisor" || designation === "Manager") &&
      <Menu.Item key="All">All</Menu.Item>
      )}
      {assetTaskDeptOptions.map((shot_header) => (
        <Menu.Item key={shot_header}>{shot_header}</Menu.Item>
      ))}
    </Menu>
  )
  }
  