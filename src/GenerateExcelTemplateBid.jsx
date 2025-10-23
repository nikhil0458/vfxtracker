

import React, { useState, useEffect } from 'react';
import { Form, Button, message, Select,Input } from 'antd';
import axios from 'axios';
import { useAuth } from './AuthContext';
import * as XLSX from 'xlsx';  // Import XLSX for Excel generation
import './GenerateExcelTemplateBid.css'
import { ip_port } from './Configs'; 
const { Option } = Select;

const GenerateExcelTemplateBid = () => {  
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);  // State to store selected project
  const [loading, setLoading] = useState(false);
  const { accessToken } = useAuth();
  const [searchText, setSearchText] = useState('');


  // useEffect(() => {
    


  //   fetchProjects();

  //   const intervalId = setInterval(() => {
  //     fetchProjects();
  //   }, 10000);  // 10000 milliseconds = 10 seconds

    
  //   return () => clearInterval(intervalId);
  // }, [accessToken]);
  
  useEffect(() => {
    fetchProjects();
  }, [accessToken]);
  
  const fetchProjects = async () => {
    try {
      const projectResponse = await axios.get(`http://${ip_port}/projects_list/`, {
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          "Content-Type": "application/json",
         },
      });
      setProjects(projectResponse.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      message.error('Failed to load project options.');
    }
  };

  const handleGenerateTemplate = () => {
    if (!selectedProject) {
      message.error('Please select a project first!');
      return;
    }
    

    const headers = ["proj", "reel", "priority", "scene", "shot", "type", "frames", "thumbnail", "exr", "sow"];
    
   
    const worksheetData = [
      headers,
      [selectedProject]  
    ];
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    
    const workbookBinary = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
    const blob = new Blob([s2ab(workbookBinary)], { type: "application/octet-stream" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "BidExcelTemplate.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };






  const handleAssetGenerateTemplate = () => {
    if (!selectedProject) {
      message.error('Please select a project first!');
      return;
    }
    

    const headers = ["proj", "priority", "sow", "asset_name",  "thumbnail", "inputs" ,"mandays" ];
    
   
    const worksheetData = [
      headers,
      [selectedProject]  
    ];
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Asset Template");

    
    const workbookBinary = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
    const blob = new Blob([s2ab(workbookBinary)], { type: "application/octet-stream" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "AssetExcelTemplate.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  
 
  const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  };

  const filteredOptions = projects.filter((project) =>
    project.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Form className='form-containers'>
      <div>
        <h1 style={{ textDecoration: "underline", color: "grey", fontSize: "18px" ,marginBottom:"10px", textAlign:"center"}}>
          {/* Temp for BiddingData */}
          Generate Template
        </h1>
        <div className='form-content'>
          <Form.Item
            name="project"
            rules={[{ required: true, message: 'Please select a project!' }]}
            style={{ marginBottom: 0, marginRight: '10px' }}
          >
            <Select
              placeholder="SELECT PROJECT"
              className="custom-dropdown"
              style={{  height: '32px', display: 'flex', alignItems: 'center' , margin: "0px"}}
              onChange={(value) => setSelectedProject(value)}  
              dropdownRender={(menu) => (
                <div>
                  <Input
                    placeholder="Search project"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ margin: '0px' }}
                  />
                  {/* <div style={{ maxHeight: '200px' ,overflowY:'auto', width: "140px"}}>{menu}</div> */}
                  <div style={{ maxHeight: '200px' , width: "140px"}}>{menu}</div>
                </div>
              )} 
            >
              {filteredOptions.map((project) => (
                <Option key={project} value={project}>
                  {project}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <div style={{display:"flex", flexDirection:"row"}}>
            <Button
              className="fetch-button"
              type="primary"
              loading={loading}
              style={{ height: '32px', display: 'flex', alignItems: 'center',margin:"11px" }}
              onClick={handleGenerateTemplate}

            >
               Shot Bidding
            </Button>
            <Button
                type="primary"
                loading={loading}
                style={{height: "32px",margin:"11px"}}
               className="fetch-button-asset-bid"
               onClick={handleAssetGenerateTemplate}
            > Asset Bidding </Button>
            </div>
          </Form.Item>
          </div>
        </div>
      
    </Form>
  );
};

export default GenerateExcelTemplateBid;
