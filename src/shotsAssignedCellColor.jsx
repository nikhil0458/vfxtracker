export const getHighlightedStyle = (record, key) => {
    if (!record.assigned_to) return {};
    let assignedKeys = [];
    try {
      assignedKeys = JSON.parse(record.assigned_to.replace(/'/g, '"'));
    } catch (error) {
      console.error("Error parsing assigned_to:", error);
    }

    return assignedKeys.includes(key)
      ? { background: "#6B8E23", fontWeight: "bold" }
      : {};
  };

export  const handleCellClick = (cellValue, columnName, rowData) => {
    console.log("Cell Value:", cellValue);
    console.log("Column Name:", columnName);
    console.log("Entire Row Data:", rowData);
  };

  export const getAssetHighlightedStyle = (record, key) => {
    if (!record.assigned_to) return {};
    let assignedKeys = [];
    try {
      assignedKeys = JSON.parse(record.assigned_to.replace(/'/g, '"'));
    } catch (error) {
      console.error("Error parsing assigned_to:", error);
    }

    return assignedKeys.includes(key)
      ? { background: "#6B8E23", fontWeight: "bold" }
      : {};
  };

// export  const handleCellClick = (cellValue, columnName, rowData) => {
//     console.log("Cell Value:", cellValue);
//     console.log("Column Name:", columnName);
//     console.log("Entire Row Data:", rowData);
//   };
