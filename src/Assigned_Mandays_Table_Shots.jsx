import React, { useState, useEffect ,forwardRef, useImperativeHandle} from 'react';
import { getMenuItems } from './shotsGetFieldsMenu';
import { Table, Button } from 'antd';

export  const AssignedMandaysTable = forwardRef (({ shotName, selectedDept, filteredData, ip_port, accessToken,refreshTrigger },ref) => {
  const [mandayData, setMandayData] = useState([]);
  const [assignedMandaysColumns, setAssignedMandaysColumns] = useState([]);




  useImperativeHandle(ref, () => ({
    getData: () => mandayData
  }));
  
  useEffect(() => {
    const fetchData = async () => {
      const fieldMenuItems = getMenuItems(selectedDept, filteredData);
      const keyFieldMenuItems = fieldMenuItems.map(item => item.key);

      const params = new URLSearchParams();
      params.append("shot_name", shotName);
      keyFieldMenuItems.forEach(field => params.append("fields", field));
      console.log("Query string:", params.toString());

      try {
        const response = await fetch(`http://${ip_port}/aggregate-mandays/?${params}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
             
        console.log("params", params)
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        const row = { key: '1', ...data };

        setMandayData([row]);
        // const transformedData = Object.entries(data).map(([key, value]) => ({
        //   key,
        //   field: key,
        //   mandays: value,
        // }));

        // setMandayData(transformedData);
        // setColumns([
        //   { dataIndex: 'field', key: 'field' },
        //   {  dataIndex: 'mandays', key: 'mandays' },
        // ]);
        const generatedAssignedMandaysColumns = Object.keys(data).map((field) => ({
            title: field,
            dataIndex: field,
            key: field,
          }));
          
       setAssignedMandaysColumns(generatedAssignedMandaysColumns)
    console.log("working")

      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    if (shotName && selectedDept) {
      fetchData();
    }
  }, [shotName, selectedDept, filteredData, ip_port, accessToken,refreshTrigger]);



    // 🔍 Function to compute the sum
    // const getAssignedMandaysSum = () => {
    //   const row = mandayData[0] || {};
    //   return Object.values(row)
    //     .filter(val => !isNaN(val))
    //     .reduce((sum, val) => sum + parseFloat(val), 0);
    // };
  
    // Expose the method to the parent
    // useImperativeHandle(ref, () => ({
    //   getAssignedMandaysSum
    // }));

  return (
   
    <Table
      columns={assignedMandaysColumns}
      dataSource={mandayData}
      pagination={false}
      bordered
    />
  );

}
)
