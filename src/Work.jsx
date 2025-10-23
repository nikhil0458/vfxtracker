import React, { useState } from 'react';
import { Menu, Dropdown, Button, Table, } from 'antd';
import './Work.css'
import chotabheem from  '/public/assets/chotabheem.jpg' 
import gg from '/public/assets/GG_3D_LOGO.jpg'
import mlb from '/public/assets/mightylittlebheem.jpg'
import mightyraju from '/public/assets/mightyraju.jpg'
import mightyraju2 from '/public/assets/mightyraju2.jpg'
import twodicon from '/public/assets/2d-icon.png'


const Work = () => {
  const [selectedOption, setSelectedOption] = useState( localStorage.getItem('workSelectedOption') || null);
  const [showTable, setShowTable] = useState(JSON.parse(localStorage.getItem('workShowTable')) || false);

  const options = ['Option 1', 'Option 2', 'Option 3'];

  const handleMenuClick = (e) => {
   
    setSelectedOption(e.key);
    setShowTable(false);
   
  
    localStorage.setItem('workSelectedOption', e.key);
    localStorage.setItem('workShowTable', false);  

  };

  const handleButtonClick = () => {
  
    setShowTable(true);
    localStorage.setItem('workShowTable', true);
    console.log("workShowTableStatus" , setShowTable)

  };

  const menu = (
   
    <Menu onClick={handleMenuClick}>
      {options.map((option, index) => (
        <Menu.Item key={option}>
          {option}
        </Menu.Item>
        
      ))}
    </Menu>
  );

  const columns = [
    { title: 'Emp_id', dataIndex: 'header1', key: 'header1',fixed: 'left', width: 100 },
    { title: 'Name', dataIndex: 'header2', key: 'header2', fixed: 'left', width: 100 },
    { title: 'Department', dataIndex: 'header3', key: 'header3' },
    { title: 'Designation', dataIndex: 'header4', key: 'header4' },
    {title: 'shot1', dataIndex: 'header5', key: 'header5'},
    {title: 'shot2', dataIndex: 'header6', key: 'header6'},
    {title: 'shot3', dataIndex: 'header7', key: 'header7'},
    {title: 'shot4', dataIndex: 'header8', key: 'header8'},
    {title: 'shot5', dataIndex: 'header9', key: 'header9'},
    {title: 'shot6', dataIndex: 'header10', key:'header10' },
    {title: 'shot7', dataIndex: 'header11', key: 'header11'},
    {title: 'shot8', dataIndex: 'header12', key: 'header12'},
    {title: 'shot9', dataIndex: 'header13', key: 'header13'},
    {title: 'shot10', dataIndex: 'header14', key: 'header14'},
    {title: 'shot11', dataIndex: 'header15', key: 'header15'},
    {title: 'shot12', dataIndex: 'header16', key: 'header16'},
    {title: 'shot13', dataIndex: 'header17', key: 'header17'},
    {title: 'shot14', dataIndex: 'header18', key: 'header18'},
    {title: 'shot15', dataIndex: 'header19', key: 'header19'},
    {
      title: 'Thumbnail',
      dataIndex: 'header20',
      key: 'header20',
      render: (text, record) => {

        return (
        <div className="thumbnail-wrapper">
          <img src={record.header20} alt="thumbnail" className="thumbnail" />
        </div>
        )
      }
    },
  ];

  const dataSets = {
    'Option 1' : [
    { key: '1', header1: 'Data 1', header2: 'Data 2', header3: 'Data 3' , header4: 'Data7'},
    { key: '2', header1: 'Data 4', header2: 'Data 5', header3: 'Data 6' , header4: 'Data8'},
    { key: '2', header1: 'Data 4', header2: 'Data 5', header3: 'Data 6' , header4: 'Data8'},
    { key: '2', header1: 'Data 4', header2: 'Data 5', header3: 'Data 6' , header4: 'Data8'},
    { key: '2', header1: 'Data 4', header2: 'Data 5', header3: 'Data 6' , header4: 'Data8'},
    { key: '2', header1: 'Data 4', header2: 'Data 5', header3: 'Data 6' , header4: 'Data8'},
    { key: '2', header1: 'Data 4', header2: 'Data 5', header3: 'Data 6' , header4: 'Data8'},
    { key: '2', header1: 'Data 4', header2: 'Data 5', header3: 'Data 6' , header4: 'Data8'},
    { key: '2', header1: 'Data W', header2: 'Data V', header3: 'Data U' , header4: 'Data T'},
    { key: '2', header1: 'Data W', header2: 'Data V', header3: 'Data U' , header4: 'Data T'},
    { key: '2', header1: 'Data W', header2: 'Data V', header3: 'Data U' , header4: 'Data T'},
    { key: '2', header1: 'Data W', header2: 'Data V', header3: 'Data U' , header4: 'Data T'},
    { key: '2', header1: 'Data W', header2: 'Data V', header3: 'Data U' , header4: 'Data T'},
    { key: '2', header1: 'Data W', header2: 'Data V', header3: 'Data U' , header4: 'Data T'},
    { key: '2', header1: 'Data W', header2: 'Data V', header3: 'Data U' , header4: 'Data T'},
    ],
    
    'Option 2': [
        { key: '1', header1: 'Data A', header2: 'Data B', header3: 'Data C', header4: 'Data G',header5: 'Data A', header6: 'Data B', header7: 'Data C', header8: 'Data G', header20:chotabheem},
        { key: '2', header1: 'Data D', header2: 'Data E', header3: 'Data F', header4:  'Data H', header5: 'Data A', header6: 'Data B', header7: 'Data C', header8: 'Data G', header20:gg},
        { key: '2', header1: 'Data D', header2: 'Data E', header3: 'Data F', header4:  'Data H', header5: 'Data A', header6: 'Data B', header7: 'Data C', header8: 'Data G', header20: mlb},
        { key: '2', header1: 'Data D', header2: 'Data E', header3: 'Data F', header4:  'Data H', header5: 'Data A', header6: 'Data B', header7: 'Data C', header8: 'Data G', header20: mightyraju},
        { key: '2', header1: 'Data D', header2: 'Data E', header3: 'Data F', header4:  'Data H', header5: 'Data A', header6: 'Data B', header7: 'Data C', header8: 'Data G', header20: mightyraju2 },
        { key: '2', header1: 'Data D', header2: 'Data E', header3: 'Data F', header4:  'Data H', header5: 'Data A', header6: 'Data B', header7: 'Data C', header8: 'Data G', header20: twodicon},
      ],

      'Option 3': [
      { key: '1', header1: 'Data X', header2: 'Data Y', header3: 'Data Z' , header4: 'Data K',},
      { key: '2', header1: 'Data W', header2: 'Data V', header3: 'Data U' , header4: 'Data T'},
      { key: '2', header1: 'Data W', header2: 'Data V', header3: 'Data U' , header4: 'Data T'},
      { key: '2', header1: 'Data W', header2: 'Data V', header3: 'Data U' , header4: 'Data T'},
      { key: '2', header1: 'Data W', header2: 'Data V', header3: 'Data U' , header4: 'Data T'},
      { key: '2', header1: 'Data W', header2: 'Data V', header3: 'Data U' , header4: 'Data T'},
      { key: '2', header1: 'Data W', header2: 'Data V', header3: 'Data U' , header4: 'Data T'},
      { key: '2', header1: 'Data W', header2: 'Data V', header3: 'Data U' , header4: 'Data T'},
      { key: '2', header1: 'Data W', header2: 'Data V', header3: 'Data U' , header4: 'Data T'},
      { key: '2', header1: 'Data W', header2: 'Data V', header3: 'Data U' , header4: 'Data T'},
      { key: '2', header1: 'Data W', header2: 'Data V', header3: 'Data U' , header4: 'Data T'},
    ],
  };


  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <Dropdown overlay={menu} trigger={['hover']}>
        <Button>
          {selectedOption || 'Select an option'}
        </Button>
      </Dropdown>
      <Button
        type="primary"
        
        onClick={handleButtonClick}
        disabled={!selectedOption}
        style={{ marginLeft: '10px' }}
      >
        Show Table
      </Button>

      {showTable && selectedOption && (
      
        <Table
         
          className="custom-table custom-pagination"
          columns={columns}
          dataSource={dataSets[selectedOption]}
          
          scroll={{ x: 2000 }} 
          
          // pagination={false}
          // pagination={{ pageSize: 5 }}
          // pagination={{ pageSize: 5 }}
           // className="custom-table"
          style={{ marginTop: '60px', border: '2px solid #ccc'}}
          bordered
          
        />
        
      )}
    </div>
  );
};

export default Work;
