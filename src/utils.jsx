

import axios from 'axios';
import { message } from 'antd';

import { ip_port } from './Configs';
import {Modal} from "antd";


export const fetchProjectCodes = async (accessToken) => {
  try {
    const response = await axios.get(`http://${ip_port}/projects_list/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });


    return [ ...response.data];
  } catch (error) {
    console.error("Error fetching project codes:", error);
    return [];
  }
};



  export const fetchDepartments = async (accessToken) => {
    try {
      const departmentResponse = await axios.get(`http://${ip_port}/departments/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}` ,
        'Content-Type': 'application/json',
        },
      });
      return departmentResponse.data;
    } catch (error) {
      console.error('Error fetching departments:', error);
      message.error('Failed to load department options.');
    }
  };

 export  const fetchProjectType = async (accessToken) => {

    try {
      const ProjectTypeResponse = await axios.get(`http://${ip_port}/project_type_list/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}` ,
        'Content-Type': 'application/json',
        },
      });

      return ProjectTypeResponse.data;

    } catch (error) {
      console.error('Error fetching departments:', error);
      message.error('Failed to load department options.');
    }
  };





   export const fetchProjectSubType = async (accessToken) => {
    try {
      const ProjectSubType = await axios.get(`http://${ip_port}/project_sub_type_list/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}` ,
        'Content-Type': 'application/json',
        },
      });
      return ProjectSubType.data;


    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      message.error('Failed to load dropdown options.');
    }
  };




  export const fetchProjectList = async (accessToken) => {
    try {
      const response = await axios.get(`http://${ip_port}/projects_list/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      console.log("asset proj data", response.data)
      return [ ...response.data];
    } catch (error) {
      console.error("Error fetching project list:", error);
      return [];
    }
  };


  export const fetchProjDepts = async (project,accessToken) => {
    console.log("tasks depts list token",accessToken);
   console.log("projecttt", project)
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
      console.log("tasksssproject", data)

     console.log("data", data)
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Unexpected data format or empty data array.");
      }

      return eval(data[0].departments);
    } catch (error) {
      console.error("Error fetching project departments data:", error);
      return null;
    }
  };


export const handlePostLogin = async (user, accessToken, ip_port) => {
  if (!user || !accessToken) return;

  try {
    const isAsset = user.department === "asset";
    const endpoint = isAsset
      ? `http://${ip_port}/asset_tasks/?status=wip&artist_id=${user.emp_id}`
      : `http://${ip_port}/wip_task_details/?artist_id=${user.emp_id}`;

    const response = await axios.get(endpoint, {
      headers: { Authorization: `Bearer ${accessToken}` },
      validateStatus: () => true,
    });

    console.log("responseData", response)
    if (response.status !== 200) {

      return;
    }



    const tasks = Array.isArray(response.data) ? response.data : [response.data];


    if (!tasks.length || !tasks[0]?._id) {
      console.log("🛑 No WIP tasks found.");
      window.hasWipTask = false;
      return;
    }

    window.hasWipTask = true;


    const task = tasks[0];


    const logId = window.loginLogId;
    const shot_logs = JSON.stringify({
      proj:task.proj,
      shot: task.task_name,
      start: new Date().toLocaleTimeString('en-GB', { hour12: false }),
      status: "WIP",
    });
    console.log("logId-----",logId)
    console.log("wip task-----",task)
    console.log("task_name-----", task.task_name)
    if (!window.shotUpdated && logId && task?.task_name) {
      window.shotUpdated = true;
      await axios.patch(`http://${ip_port}/login_log/${logId}/`, {

        shot: task.task_name,
        proj:task.proj,
        shot_logs:shot_logs,

      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      console.log("✅ Updated login log with shot:", task.task_name);

    }

  }
  catch (err) {
    console.error("❌ Post-login WIP check failed:", err);
    window.hasWipTask = false;
  }
};




