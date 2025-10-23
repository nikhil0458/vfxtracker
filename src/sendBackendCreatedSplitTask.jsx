import axios from "axios"
import {ip_port} from "./Configs"
 
export  const sendBackendCreatedSplitTask = async (tasks,accessToken) => {
    console.log("tasks",tasks)
    console.log("accesstoken",accessToken)
    try {
        const response = await axios.post(
            `http://${ip_port}/create_split_tasks/`,
            JSON.stringify(tasks),
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization':`Bearer ${accessToken}`

                }
            }
        );
        console.log("response", response)
        if (response.status === 200 || response.status === 201){
          console.log("✅ Success:", response.data);
          return {status:"success", message:response.data}
          // return `✅ Success:", ${response.data}`

        }
      } catch (error) {
        if (error.response && error.response.status === 500) {
          
          console.error("❌ Server Error (500):", error.response.data);
         
          // return `❌ Server Error (500):", ${error.response.data}`
          return {status:"error", message:error.response?.data || error.message }
          // throw new Error("Internal Server Error");
          
        } 
        // else {
        //   console.error("❌ Error:", error.message);
        //   // return `❌ Error:, ${error.message}`;
        //   // throw new Error("Something went wrong while sending data");
         

        // }
    }
}