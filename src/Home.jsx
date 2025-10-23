import React, { useEffect, useState } from "react";
// import { Button, Card, Radio } from "antd";
import axios from "axios";
// import CustomTable from "./CustomTable";
import "./Home.css";


// const users = [
//   { id: 1, name: "Alice", email: "alice@example.com", department: "HR" },
//   { id: 2, name: "Bob", email: "bob@example.com", department: "Engineering" },
//   { id: 3, name: "Charlie", email: "charlie@example.com", department: "Design" },
//   { id: 4, name: "David", email: "david@example.com", department: "Engineering" },
//   { id: 5, name: "Eve", email: "eve@example.com", department: "Marketing" },

  
//   { id: 6, name: "Alice", email: "alice@example.com", department: "HR" },
//   { id: 7, name: "Bob", email: "bob@example.com", department: "Engineering" },
//   { id: 8, name: "Charlie", email: "charlie@example.com", department: "Design" },

 
//   { id: 9, name: "Faythe", email: "faythe@example.com", department: "Finance"},
//   { id: 10, name: "Grace", email: "grace@example.com", department: "Engineering" },
//   { id: 11, name: "Heidi", email: "heidi@example.com", department: "Design" },
//   { id: 12, name: "Ivan", email: "ivan@example.com", department: "QA" },
//   { id: 13, name: "Judy", email: "judy@example.com", department: "HR" },

 
//   { id: 14, name: "Grace", email: "grace@example.com", department: "Engineering" },
//   { id: 15, name: "Bob", email: "bob@example.com", department: "Engineering" },
//   { id: 16, name: "Eve", email: "eve@example.com", department: "Marketing" },

  
//   { id: 17, name: "Mallory", email: "mallory@example.com", department: "Legal" },
//   { id: 18, name: "Oscar", email: "oscar@example.com", department: "R&D" },
//   { id: 19, name: "Peggy", email: "peggy@example.com", department: "Sales" },
//   { id: 20, name: "Trent", email: "trent@example.com", department: "Support" },
// ];

const Home = () => {
 
   
  return (
      <>
      <p>Home</p>
      
       {/* <CustomTable data={users} /> */}
        </>
  //  temporarily removed the beolw code 
    
  );
};
export default Home;


// code

// <div className="home_bg_container">
    //   <div className="home_container">
    //     <div className="main_heading_container">
       
    //       <h className="main_heading">VFX TRACKER</h>
    //     </div>

    //     <div className="user_data_container">
    //       <div className="user_heading_container">
    //         <Button className="refresh_button">Refresh</Button>
    //         <h1 className="user_heading">User Details</h1>
    //         <Button className="logout_button">Logout</Button>
    //       </div>
    //       <div className="user_details_container">
    //         <div className="user_column">
    //           <div className="user_row">
    //             <label className="user_label">Name: </label>
    //           </div>
    //           <div className="user_row">
    //             <label className="user_label">Department:</label>
    //           </div>
    //           <div className="user_row">
    //             <label className="user_label">Log Time:</label>
    //           </div>
    //         </div>
    //         <div className="user_column">
    //           <div className="user_row">
    //             <label className="user_label">Emp_Id:</label>
    //           </div>
    //           <div className="user_row">
    //             <label className="user_label">Designation:</label>
    //           </div>
    //           <div className="user_row">
    //             <label className="user_label">Time Lapsed:</label>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //     <div className="user_tasks_container">
    //       <div className="tasks_refresh_button_container">
    //         <Button className="tasks_refresh_button">Refresh</Button>
    //       </div>
    //       <h className="tasks_heading">Latest Tasks</h>
    //     </div>

    //     <div className="modes_container">
    //       <h1 className="modes_heading">Mode's</h1>
    //       <div className="wrapping_modes_container">
    //        <Radio.Group
    //           onChange={(e) => setSelected(e.target.value)}
    //           value={selected}
    //           className="wrapping_modes_container"
    //         >
    //           <div className="radio_option_row">
    //             <Radio className="radio_option" value="Work">
    //               Work
    //             </Radio>
    //             <span className="timer">00:00:00</span>
    //           </div>
    //           <div className="radio_option_row">
    //             <Radio className="radio_option" value="Team_Meet">
    //               Team_Meet
    //             </Radio>
    //             <span className="timer">00:00:00</span>
    //           </div>
    //           <div className="radio_option_row">
    //             <Radio className="radio_option" value="Management_Meet">
    //               Management_Meet
    //             </Radio>
    //             <span className="timer">00:00:00</span>
    //           </div>
    //           <div className="radio_option_row">
    //             <Radio className="radio_option" value="Break">
    //               Break
    //             </Radio>
    //             <span className="timer">00:00:00</span>
    //           </div>
    //           <div className="radio_option_row">
    //             <Radio className="radio_option" value="Simulation">
    //               Simulation
    //             </Radio>
    //             <span className="timer">00:00:00</span>
    //           </div>
    //           <div className="radio_option_row">
    //             <Radio className="radio_option" value="Rendering">
    //               Rendering
    //             </Radio>
    //             <span className="timer">00:00:00</span>
    //           </div>
    //           <div className="radio_option_row">
    //             <Radio className="radio_option" value="No_Work">
    //               No_Work
    //             </Radio>
    //             <span className="timer">00:00:00</span>
    //           </div>
    //           <div className="radio_option_row">
    //             <Radio className="radio_option" value="IT_Issue">
    //               IT_Issue
    //             </Radio>
    //             <span className="timer">00:00:00</span>
    //           </div>
    //           <div className="radio_option_row">
    //             <Radio className="radio_option" value="Prod_Sup">
    //               Prod_Sup
    //             </Radio>
    //             <span className="timer">00:00:00</span>
    //           </div>
    //           <div className="radio_option_row">
    //             <Radio className="radio_option" value="Idle">
    //               Idle
    //             </Radio>
    //             <span className="timer">00:00:00</span>
    //           </div>
    //         </Radio.Group>
    //       </div>
    //     </div>
    //     <div className="status_container">
    //       <p className="login_status_heading"> Login Status:</p>
    //     </div>
    //   </div>
    // </div>