// import { sendToBackend } from "./sendToBackend";

// export const handleAssignTask = (selectedRowData,selectedArtist,setArtistPopupVisible,selectedFieldLabel,selectedDept,user,accessToken,refreshTableData) => {
//   console.log("Artist Selected:", selectedArtist);
//   const onlyRequiredKeys = ["proj","reel", "priority","scene", "shot", "type", "frames", "duration", "thumbnail", "exr", "sow",
//     "cgi_character","cgi_creature","cgi_asset",
//   ];
//   setArtistPopupVisible(false);
//   const selected_row = selectedRowData.map((obj) => {
//     const filtered_Object = {};
//     onlyRequiredKeys.forEach((key) => {
//       if (key in obj) {
//         filtered_Object[key] = obj[key];
//       }
//     });

//     const mandays = Number(selectedRowData[0][selectedFieldLabel]);
//     const mandaysToTime = (mandays) => {
//       const totalSeconds = Number(mandays) * 7.5 * 3600;

//       const hours = Math.floor(totalSeconds / 3600);
//       const minutes = Math.floor((totalSeconds % 3600) / 60);
//       const seconds = Math.floor(totalSeconds % 60);

//       const pad = (num) => String(num).padStart(2, "0");

//       return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
//     };

//     const selectedArtistName = selectedArtist;
//     const [emp_id, artist_name] = selectedArtistName.split("_");
//     const artist_emp_id = parseInt(emp_id);

//     const DynamicObject = {
//       proj: filtered_Object.proj,
//       reel: filtered_Object.reel,
//       priority: filtered_Object.priority,
//       scene: filtered_Object.scene,
//       shot: filtered_Object.shot,
//       type: filtered_Object.type,
//       thumbnail: filtered_Object.thumbnail,
//       frames: filtered_Object.frames,
//       duration: filtered_Object.duration,
//       exr: filtered_Object.exr,
//       sow: filtered_Object.sow,
//       cgi_character: filtered_Object.cgi_character,
//       cgi_creature: filtered_Object.cgi_creature,
//       cgi_asset: filtered_Object.cgi_asset,

//       department: selectedDept,
//       field: selectedFieldLabel,

//       task_name: `${
//         filtered_Object.shot + "_" + selectedFieldLabel + "_" + artist_emp_id
//       }`,
//       mandays: Number(selectedRowData[0][selectedFieldLabel]),
//       hours: mandaysToTime(mandays),
//       artist_id: artist_emp_id,
//       artist_name: artist_name,
//       assigned_by: user.emp_id,
//     };

//     sendToBackend(DynamicObject,accessToken)
//     console.log("DynamicObject", DynamicObject);

//   });

//   console.log("selected_row", selected_row);
// };

import { sendToBackend } from "./sendToBackend";
import { sendAssetToBackend } from "./sendToBackend";
import { message } from "antd";

export const handleAssignTask = async (
  selectedRowData,
  selectedArtist,
  setArtistPopupVisible,
  selectedFieldLabel,
  selectedDept,
  user,
  accessToken,
  fetchData,
  setRefreshTrigger
) => {
  console.log("Artist Selected:", selectedArtist);
  const onlyRequiredKeys = [
    "proj",
    "reel",
    "priority",
    "scene",
    "shot",
    "type",
    "frames",
    "duration",
    "thumbnail",
    "exr",
    "sow",
    "cgi_character",
    "cgi_creature",
    "cgi_asset",
  ];

  const mandaysToTime = (mandays) => {
    const totalSeconds = Number(mandays) * 7.5 * 3600;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const pad = (num) => String(num).padStart(2, "0");
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const [emp_id, artist_name] = selectedArtist.split("_");
  const artist_emp_id = parseInt(emp_id);

  try {
    const sendTasks = selectedRowData.map(async (obj) => {
      const filtered_Object = {};
      onlyRequiredKeys.forEach((key) => {
        if (key in obj) {
          filtered_Object[key] = obj[key];
        }
      });

      const mandays = Number(obj[selectedFieldLabel]);

      const DynamicObject = {
        ...filtered_Object,
        department: selectedDept,
        field: selectedFieldLabel,
        task_name: `${filtered_Object.shot}_${selectedFieldLabel}_${artist_emp_id}`,
        mandays: mandays,
        hours: mandaysToTime(mandays),
        artist_id: artist_emp_id,
        artist_name: artist_name,
        assigned_by: user.emp_id,
      };

      console.log("DynamicObject", DynamicObject);
      return sendToBackend(DynamicObject, accessToken);
    });

    await Promise.all(sendTasks);
    console.log("All tasks assigned successfully");
    message.success("Tasks assigned successfully!");

    // setTimeout(() => {
    //  setArtistPopupVisible(false);
    //  fetchData();
    //  updateShotsColumns();
    // }, 1000);

    // Fetch the updated data
    setArtistPopupVisible(false);
    fetchData();
    setRefreshTrigger((prev) => prev + 1);
  } catch (err) {
    message.error("Failed to assign one or more tasks.");
    console.error("Task assignment failed", err);
  }
};




export const handleAssignAssetTask = async (
  selectedAssetRow,
  selectedAssetArtist,
  setIsAssetArtistModalVisible,
  selectedAssetField,
  DEFAULT_DEPARTMENT,
  user,
  accessToken
) => {
  const onlyRequiredAssetKeys = [
    "proj",
    "priority",
    "sow",
    "asset_name",
    "thumbnail",
    "inputs",
    "mandays",
  ];

  const mandaysToTime = (mandays) => {
    const totalSeconds = Number(mandays) * 7.5 * 3600;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const pad = (num) => String(num).padStart(2, "0");
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const [emp_id, artist_name] = selectedAssetArtist.split("_");
  const artist_emp_id = parseInt(emp_id);

  try {
    const sendTasks = selectedAssetRow.map(async (obj) => {
      const filtered_Object = {};
      onlyRequiredAssetKeys.forEach((key) => {
        if (key in obj) {
          filtered_Object[key] = obj[key];
        }
      });

      const mandays = Number(obj[selectedAssetField]);

      const DynamicAssetObject = {
        ...filtered_Object,
        department: DEFAULT_DEPARTMENT,
        field: selectedAssetField,
        task_name: `${filtered_Object.asset_name}_${selectedAssetField}_${artist_emp_id}`,
        mandays: mandays,
        hours: mandaysToTime(mandays),
        artist_id: artist_emp_id,
        artist_name: artist_name,
        assigned_by: `${user.emp_id}_${user.emp_name}`,
      };

      console.log("DynamicObjectCreated", DynamicAssetObject);
      return sendAssetToBackend(DynamicAssetObject, accessToken);
    });

    await Promise.all(sendTasks);
    console.log("All tasks assigned successfully");
    message.success("Tasks assigned successfully!",8);

    // setTimeout(() => {
    //  setArtistPopupVisible(false);
    //  fetchData();
    //  updateShotsColumns();
    // }, 1000);

    // Fetch the updated data
    setIsAssetArtistModalVisible(false)
    //  fetchData();
    //  setRefreshTrigger(prev => prev + 1);
  } catch (err) {
    // message.error("Failed to assign one or more tasks.");
    console.error("Task assignment failed", err.response);
  }
};
