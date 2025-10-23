import React, { useState } from 'react';
import { Select, DatePicker, Button } from 'antd';
import { PieChartComponent, BarChartComponent, TableComponent } from './ReportsTypeData.jsx'; 
// Assume you have created these components

const { Option } = Select;

// Reusable Dropdown Component
const Dropdown = ({ label, options, onChange }) => (
  <div>
    <label>{label}</label>
    <Select placeholder={`Select ${label}`} style={{ width: 200, marginLeft: 10 }} onChange={onChange}>
      {options.map((option) => (
        <Option key={option} value={option}>
          {option}
        </Option>
      ))}
    </Select>
  </div>
);


const DatePickerComponent = ({ onChange }) => (
  <DatePicker onChange={onChange} style={{ marginLeft: 10 }} />
);

const ReportsType = () => {
  const [reportType, setReportType] = useState(null);
  const [chartType, setChartType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [fetchedData, setFetchedData] = useState([]);
  const [pieChartData, setPieData]= useState([]);
  const [modeDataDetails, setModeDataDetails] = useState([]);


  const reportOptions = ['Employee Dashboard', 'Bidding Summary'];

  
  const chartOptions = ['Pie Chart', 'Bar Graph', 'Table'];

 




  const calculateModeData = (filtered) => {
    if (!filtered || filtered.length === 0) return []; // Ensure filteredData exists
  
   

    const modeCounts = filtered.reduce((acc, item) => {
      acc[item.current_mode] = (acc[item.current_mode] || 0) + 1;
      return acc;
  }, {});

 console.log('modeCounts',modeCounts);


  const totalItems = filtered.length;

  console.log("totalItems",totalItems)

  const modeDetails = Object.keys(modeCounts).map((key) => ({
      name: key,
      value: modeCounts[key],
      percentage: ((modeCounts[key] / totalItems) * 100).toFixed(2),
  })
 
);

 setModeDataDetails(modeDetails)
 console.log("modeDataDetails", modeDataDetails)
 localStorage.setItem('modeDataDetails', JSON.stringify(modeDetails));
  };




  const fetchLoginLogs = async () => {
    try {
      const response = await fetch("/loginlogs.json"); 
      const data = await response.json();
      
      const filteredIdData = data.map(({ _id, ...rest }) => rest); 
       
      console.log("filteredIdData",filteredIdData)
      
      const filteredData = filteredIdData.filter(log => log.date === selectedDate);
      
      console.log("filtereddData", filteredData)


      setFetchedData(filteredData);
      
      calculateModeData(filteredData)
      
      const statusCounts = filteredData.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
        
    
    
      }, {});
  
      console.log("statusCounts", statusCounts)
       

      const totalItems = filteredData.length;

      let pieData = Object.keys(statusCounts).map((key) => {
        let percentage = ((statusCounts[key] / totalItems) * 100);
        return {
          name: key,
          value: statusCounts[key],
          percentage: percentage.toFixed(2) 
        };
      });

      const sumPercentages = pieData.reduce((sum, item) => sum + parseFloat(item.percentage), 0);
      console.log("sumPercentages",sumPercentages)
      const diff = (100 - sumPercentages).toFixed(2); 
      if (pieData.length > 0 && Math.abs(diff) > 0.01) {
        pieData[pieData.length - 1].percentage = (parseFloat(pieData[pieData.length - 1].percentage) + parseFloat(diff)).toFixed(2);
      }

      setPieData(pieData)
      

    } catch (error) {
      console.error("Error fetching the JSON file:", error);
    }


  

    

  };
   
  
  
  
  const handleReportTypeChange = (value) => setReportType(value);
  const handleDateChange = (date, dateString) => setSelectedDate(dateString);
  const handleChartTypeChange = (value) => setChartType(value);

  
  const renderData = () => {
    console.log("fetcheddData",fetchedData)
    if (!fetchedData) return null;


    switch (chartType) {

      case 'Pie Chart':
        return <PieChartComponent data={pieChartData} />;
      case 'Bar Graph':
        return <BarChartComponent data={fetchedData} title="Bar Chart"  hueOffset={10} />;
      case 'Table':
        return <TableComponent data={fetchedData} />;

      default:
        return null;
    }
  };

  return (
    <div>
      {/* Top-level ReportType Dropdown */}
      <Dropdown label="Report Type" options={reportOptions} onChange={handleReportTypeChange} />

      {/* Conditional rendering based on ReportType selection */}
      {reportType === 'Employee Dashboard' && (
        <>
          <div style={{ marginTop: 16 }}>
            {/* Date Picker */}
            <label>Select Date:</label>
            <DatePickerComponent onChange={handleDateChange} />
          </div>

          <div style={{ marginTop: 16 }}>
            {/* Chart Type Dropdown */}
            <Dropdown label="Chart Type" options={chartOptions} onChange={handleChartTypeChange} />
          </div>

          <div style={{ marginTop: 16 }}>
          
            <Button type="primary" onClick={fetchLoginLogs} disabled={!selectedDate || !chartType}>
              Get Data
            </Button>
          </div>
        </>
      )}

      
      <div style={{ marginTop: 32 }}>
        {renderData()}
      </div>
    </div>
  );
};

export default ReportsType;
