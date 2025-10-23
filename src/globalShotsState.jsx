// export const shotsGlobalData = { value:null };

// export const setShotsGlobalData = (data) => {
//   shotsGlobalData.value = data;
//   console.log("shotsGlobalData", shotsGlobalData.value)
// };
// export const getGlobalShotsData=()=> shotsGlobalData.value;

export const shotsGlobalData = { value: JSON.parse(localStorage.getItem("shotsData")) || null };

export const setShotsGlobalData = (data) => {
  shotsGlobalData.value = data;
  localStorage.setItem("shotsData", JSON.stringify(data)); 
  console.log("shotsGlobalData updated:", shotsGlobalData.value);
};

export const getGlobalShotsData = () => {
  return shotsGlobalData.value || JSON.parse(localStorage.getItem("shotsData"));
};

