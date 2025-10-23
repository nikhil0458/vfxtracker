// utils/getMenuItems.js or same component file
export const getMenuItems = (selectedDept, filteredData) => {
    const items = [];
  
    if (selectedDept && selectedDept !== "select") {
      items.push({
        key: selectedDept.toLowerCase(),
        label: selectedDept.toLowerCase(),
      });
  
      const subFields = filteredData[0]?.bid_micro[selectedDept] || [];
      subFields.forEach((subColumn) => {
        items.push({
          key: subColumn,
          label: subColumn,
        });
      });
    } else {
      items.push({ key: "no_fields", label: "No Fields Available", disabled: true });
    }
  
    return items;
  };
  