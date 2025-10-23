import React, { useState, useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import { json, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./Login.css";
import axios from "axios";
import { ip_port } from "./Configs";
// import { connectWebSocket, requestTokens, closeWebSocket } from "./WebSocketManager";
import {
  connectWebSocket,
  requestTokens,
  closeWebSocket,
  getDataToken
} from "./WebSocketManager";
// import Logout from "./Logout";
// import resolve from "arquero/dist/types/helpers/selection";
// export let ws;
// export let dataToken = null;
// export let radioButtonValue = null;
// export let openedFilePath = null;





// export function sendFilePathToOpen(filePath) {
//   if (ws && ws.readyState === WebSocket.OPEN) {
//     const message = `open_file:${filePath}`;
//     ws.send(message);
//     // console.log("📤 Sent file path to open:", filePath);
//   } else {
//     console.log("⚠️ WebSocket not connected.");
//   }
// }







const Login = () => {

 


 

  const [loading, setLoading] = useState(false);
  
 
  const navigate = useNavigate();
  const { login, accessToken ,logout} = useAuth();

  const [form] = Form.useForm();


  const getLoginLogId = async (emp_id, token) => {
    // console.log("working");
    // console.log("emp_id", emp_id);
    const today = new Date().toISOString().split("T")[0]; 
    // console.log("todayy", today);

    try {
      const res = await axios.get(`http://${ip_port}/login_log/`, {
        params: { emp_id: emp_id, date: today },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log("res---", res);
      // if (res.data && res.data._id) {
      if (Array.isArray(res.data) && res.data.length > 0 && res.data[0]._id) {
        const logId = res.data[0]._id;

        window.loginLogId = logId;
       
      } else {
        console.warn("⚠️ Login log _id not found in response.");
      }
    } catch (error) {
      console.error("❌ Error fetching login log:", error);
    }
  };

  
  const handleLogin = async (values) => {
    // await sleep(15000);

    // console.log("-----ws------", ws);
    // let dataToken;
    setLoading(true);

    try {
     
      await connectWebSocket();
     const dataToken = await requestTokens();
  
      message.warning(dataToken);

   

     const accessToken = dataToken.access;
     const refreshToken = dataToken.refresh;

   

     if (accessToken && refreshToken) {
       console.log("accessToken", accessToken);
       console.log("refreshToken", refreshToken);

      
     
       const { emp_id, emp_name, department, designation, controls } = dataToken;
       const userData = { emp_id, emp_name, department, designation, controls };
        if (userData) {
         login({ accessToken, refreshToken, ...userData });
         await getLoginLogId(emp_id, accessToken);

        navigate("/app/home");
      } else {
        message.error("User not found. Please contact the admin.");
      }
    }
    } catch (err) {
      console.error("Token request failed:", err);
      message.error("Token request failed.");
    }
 
    setLoading(false);
  };

  return (
    <div className="login">
      <div className="login-container">
        <div style={{ maxWidth: "500px" }}>
          {/* <h1 className="heading">Login</h1> */}
          <Form form={form} onFinish={handleLogin}>
         
            <Form.Item>
              <Button
                type="primary"
                className="login-button"
                htmlType="submit"
                loading={loading}
              >
              
               Open Main Window
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;













// function requestTokens() {
//   return new Promise((resolve, reject) => {
//     if (ws && ws.readyState === WebSocket.OPEN) {
//       const handleMessage = (event) => {
//         const parsed = JSON.parse(event.data);
//         // console.log("event_parsed", parsed)
//         console.log("requesTokenData", parsed)
//         if (parsed && parsed.access && parsed.refresh) {
//           ws.removeEventListener("message", handleMessage);
//           resolve(parsed);
//         }
//       };

//       ws.addEventListener("message", handleMessage);
//       ws.send("get_tokens");
//     } else {
//       reject("⚠️ WebSocket not connected.");
//     }
//   });
// }


// function connectWebSocket() {

//   if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
//     console.log("⚠️ WebSocket already connected or connecting.");
//     return ;
//   }



//   // useEffect(()=> {
//   ws = new WebSocket("ws://localhost:8118");

//   ws.onopen = () => {
//     console.log("✅ Connected to WebSocket server.");
    
//     // requestTokens();
//   };

//   ws.onmessage = (event) => {
//     console.log("getting tokens");
//     // console.log("event", event)
//     console.log("type check", typeof JSON.parse(event.data),JSON.parse(event.data) );
  
//    try{
//     const  parsedData = JSON.parse(event.data);
//    console.log("parsedData", parsedData)
//     if (
//       typeof  parsedData === "object" &&
//       "access" in parsedData
    // ) {
      // console.log("got token");
      // dataToken=parsedData
    // };

      // Status
      // if (parsedData && typeof parsedData === "object" && "radio_button" in parsedData) {
      //   const receivedData = parsedData.radio_button
      //   const message = receivedData.trim().toLowerCase();

      //   console.log("⚡ Status received:", message, "radio button type",typeof message);
        
      //   window.dispatchEvent(new CustomEvent("statusChange", { detail: message }));
      //   window.desktopStatus = message;
      // }


      // if (parsedData && typeof parsedData === "object" && "status" in parsedData && parsedData.status === "logout") {
      

        // console.log("🔒 WebSocket instructed logout");

  // ✅ Fire global event for logout
  // window.dispatchEvent(new CustomEvent("wsForceLogout"));
  //     }

  //  }catch(err){
  //   console.error("❌ Failed to parse WebSocket message:", err);
  //  }

  // }
  
  // ws.onclose = () => {
  //   console.log("❌ Disconnected. Retrying in 3s...");
  //   setTimeout(connectWebSocket, 3000);
  // };

  // ws.onerror = (err) => {
  //   console.error("WebSocket error:", err);
  // };
// }, []);
// }


// useEffect(()=> {
// connectWebSocket();
// },[]);
   {/* <Form.Item
              name="emp_id"
              className="input-container"
              rules={[
                { required: true, message: <span style={{color:"white"}}>Please enter your Employee ID!</span> },
              ]}
            >
              <Input placeholder="Employee ID" />
            </Form.Item> */}
            {/* <Form.Item
              name="password"
              className="input-container-password"
              rules={[
                { required: true, message: <span style={{color:"white"}}>"Please enter your password!" </span> },
                {
                  min: 4,
                  message: <span style={{color: "white"}}>Password must be at least 4 characters long!</span>
                },
              ]}
            >
              <Input.Password
                placeholder="Password"
                maxLength={16}
                value={passwordValue}
                onChange={handlePasswordChange}
              />
            </Form.Item>

            {passwordError && (
              // <div style={{ color: "red" }}>{passwordError}</div>
              <div style={{ color: "white" }}>{passwordError}</div>
            )} */}