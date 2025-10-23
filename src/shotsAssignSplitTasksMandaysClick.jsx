import TextArea from "antd/es/input/TextArea";
import { sendBackendCreatedSplitTask } from "./sendBackendCreatedSplitTask";

export const handleAssignSplitTasksMandaysClick = async( selectedRowData,selectedAssignSplitArtist,selectedWindowFieldLabel,selectedDept,user,accessToken,
  splitTableData,fetchData, setRefreshTrigger,setAssignSplitPopUp
) => {
 
  const onlyRequiredKeys = ["proj","reel", "priority", "scene", "shot", "type", "frames", "duration", "thumbnail", "exr", 
    "sow", "cgi_character", "cgi_creature","cgi_asset",
  ];
  const baseData = selectedRowData[0];
  console.log("selectedRowData",selectedRowData)
  console.log("baseData",baseData)
  const filtered_Split_Task_Object = {};
  onlyRequiredKeys.forEach((key) => {
    if (key in baseData) {
      filtered_Split_Task_Object[key] = baseData[key];
    }
  });

const mandaysToTime = (mandays) => {
    const totalSeconds = Number(mandays) * 7.5 * 3600;

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    
    const pad = (num) => String(num).padStart(2, "0");

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const tasks = splitTableData.map((row) => {
    console.log("splitTableData",splitTableData)
    const [emp_id, artist_name] = row.artist.split("_");
    const artist_emp_id = parseInt(emp_id);
    const mandays = parseFloat(row.mandays);

    
    const task = {
      ...filtered_Split_Task_Object,
      department: selectedDept,
      field: selectedWindowFieldLabel,

      task_name: `${filtered_Split_Task_Object.shot}_${selectedWindowFieldLabel}_${artist_emp_id}`,
      mandays: mandays,
      hours: mandaysToTime(mandays),
      artist_id: artist_emp_id,
      artist_name: artist_name,
      assigned_by: user.emp_id,
    }
    console.log("task",task)
    return task;
    });
    
    
  console.log("tasks",tasks)
 const  status_display =  await sendBackendCreatedSplitTask(tasks, accessToken)
 if (status_display?.status === 'success') {
  // ✅ Success! Perform UI updates
  setAssignSplitPopUp(false);
  fetchData();
  setRefreshTrigger(prev => prev + 1);
}

 console.log("status_display",status_display)
 return status_display;
      
};

