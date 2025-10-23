import axios from "axios";
import {ip_port} from "./Configs"
import { message } from "antd";




export const sendToBackend = async (DynamicObject,accessToken) => {

    
    try {
      const response = await axios.post(
        `http://${ip_port}/assign_shot_task/`,
        JSON.stringify(DynamicObject), 
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          }
        }
      );
     console.log("response", response)
      if (response.status === 201) {
        console.log("✅ Success:", response.data);
      }
    } catch (error) {
      if (error.response && error.response.status === 500) {
        console.error("❌ Server Error (500):", error.response.data);
        throw new Error("Internal Server Error");
      } else {
        console.error("❌ Error:", error.message);
        throw new Error("Something went wrong while sending data");
      }
    }
  };



export const sendAssetToBackend=async(DynamicObject,accessToken)  =>{
  try {
    const response = await axios.post(
      `http://${ip_port}/asset_tasks/`,
      JSON.stringify(DynamicObject), 
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        }
      }
    );
   console.log("response", response)
    if (response.status === 201) {
      console.log("✅ Success:", response.data);
      // message.success("✅ Success:", response.data,8);
    }
  } catch (error) {
  

    if (error.response) {
      // Backend responded with a status other than 2xx
      console.error(" Error Response:", error.response.data);
      message.error(` Error: ${JSON.stringify(error.response.data)}`,8);
      throw new Error(JSON.stringify(error.response.data));
    } else if (error.request) {
      // Request was made but no response
      console.error(" No response received:", error.request);
      message.error(" No response received from server.");
      throw new Error("No response from server.");
    } else {
      // Other errors
      console.error("❌ Error:", error.message);
      message.error(`❌ Error: ${error.message}`,8);
      throw new Error(error.message);
    }
  
  }
}