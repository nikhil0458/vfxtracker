import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Select, InputNumber,Checkbox ,notification} from "antd";
// import { useForm } from 'antd/es/form/Form'; 
import axios from "axios";
import { useAuth } from "./AuthContext";
import "./UserForm.css";
import { ip_port } from './Configs'; 

import {
 fetchProjectCodes,
  fetchDepartments,
  fetchProjectType,
  fetchProjectSubType,
} from "./utils";
const { Option } = Select;




const CreateProjectForm = () => {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [ProjectTypes, setProjectType] = useState([]);
  const [ProjectSubTypes, setProjectSubType] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectValue, setSelectedProjectValue] = useState(null);
  
  
  
  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [formMode, setFormMode] = useState('create');
  const [projectId, setProjectId] = useState(null);

  const handleCreateProject = async (values) => {
    console.log("valuessss---", values);

    try {
      values.lock = "false";

      const response = await axios.post(
        `http://${ip_port}/projects/`,
        values,
        {
          headers: {
            
            'Authorization': `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }


      );

      const updatedProjectCodes = await fetchProjectCodes(accessToken);
    
     
      setProjects(updatedProjectCodes);
      console.log("res", response.data)
      // message.success(`${JSON.stringify(response.data)}`);
      notification.success({description: `${JSON.stringify(response.data)}`});

      console.log("message",message.success(`${JSON.stringify(response.data)}`));
      createForm.resetFields()
    } catch (error) {
      if (error.response) {
        // message.error(`${JSON.stringify(error.response.data)}`);
        notification.error({description: `${JSON.stringify(error.response.data)}`})
        }

    }
  };


  const handleUpdateProject = async (values) => {

    setLoading(true);

    try {
      const response= await axios.patch(`http://${ip_port}/projects/${projectId}/`, values, {
        
      
     
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
     
      // message.success("Project updated successfully!");
      notification.success({description:"Project updated successfully!"})

      updateForm.resetFields()
    } catch (error) {
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
        // message.error(`Failed to update project: ${error.response.data.detail || 'Unknown error'}`);
        notification.error({description:`Failed to update project: ${error.response.data.detail || 'Unknown error'}`});
      } else {
        // message.error("Failed to update project: Network error or server is not responding.");
        notification.error({
          description: "Failed to update project: Network error or server is not responding."
        })
      }
    } finally {
      setLoading(false);
    }
  };
  const handleFetch = async (projectCode) => {
    
  
    if (!projectCode) {
      // message.error("Please select a project.");
      notification.error({description: "Please select a project."})
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://${ip_port}/projects/`, {
        params: {
          project_code: projectCode
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      const responseData = response.data[0];
      const fetchedProjectId=responseData._id
      
      setProjectId(fetchedProjectId);
      
      


     
      let departmentsArray = [];
    if (responseData.departments) {
      try {
        departmentsArray = JSON.parse(responseData.departments.replace(/'/g, '"'));
        
      } catch (error) {
        console.error("Error parsing departments:", error);
      }
    }
     
   
    

   
      updateForm.setFieldsValue({
        project_name: responseData.project_name,
        project_code: responseData.project_code,
        project_type: responseData.project_type,
        project_sub_type: responseData.project_sub_type,
        fps: responseData.fps,
        colorspace: responseData.colorspace,
        resolution:responseData.resolution,
        departments: departmentsArray,
       
        lock: responseData.lock,  
       
      });
     
     
      console.log("before")
      // message.success("Project details fetched successfully!");
      notification.success({description:"Project details fetched successfully!"});
      console.log("after")

    } catch (error) {
      console.error("Error fetching project details:", error);
      // message.error("Failed to fetch project details.");
      notification.error({description: "Failed to fetch project details."});
      
    }
    setLoading(false);
  };

  const handleProjectChange = (value) => {
    setSelectedProjectValue(value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const departmentData = await fetchDepartments(accessToken);
        const projectTypeData = await fetchProjectType(accessToken);
       
        const projectSubTypeData = await fetchProjectSubType(accessToken);
        const projectData = await fetchProjectCodes(accessToken);
        
        setDepartments(departmentData);
        setProjectType(projectTypeData);
        setProjectSubType(projectSubTypeData);
        setProjects(projectData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [accessToken]);
  // }, []);





  const handleFormSwitch = (mode) => {
    setFormMode(mode);
    if (mode === 'create') {
      createForm.resetFields();
    } else {
      updateForm.resetFields();
    }
  };

  return (
    <div className="form-containers" style={{margin:"40px"}} >
      
        <h1 className="heading" style={{color:"grey"}}>{formMode === 'create' ? 'Create Project' : 'Update Project Data'}</h1>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
          
        }}
      >
       
          <Button type={formMode === 'create' ? 'primary' : 'default'} onClick={() => handleFormSwitch('create')}>
          Create
        </Button>
        <Button type={formMode === 'update' ? 'primary' : 'default'} onClick={() => handleFormSwitch('update')} style={{ marginLeft: '16px' }}>
          Update
        </Button>
      </div>

      {formMode === 'create' && (
        <Form onFinish={handleCreateProject} form={createForm} layout="horizontal">
          <Form.Item
            name="project_name"
            label="Project Name"
            rules={[
              { required: true, message: "Please enter the project name!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="project_code"
            label="Project Code"
            rules={[
              { required: true, message: "Please enter the project code!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="project_type"
            label="Project Type"
            rules={[{ required: true, message: "Please enter project type!" }]}
          >
            <Select
              placeholder="SELECT PROJECT TYPE"
              className="custom-dropdown"
            >
              {ProjectTypes.map((ProjectType) => (
                <Option key={ProjectType} value={ProjectType}>
                  {ProjectType}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="project_sub_type"
            label="Project Sub Type"
            rules={[
              { required: true, message: "Please enter project sub type!" },
            ]}
          >
            <Select
              placeholder="SELECT PROJECT SUB TYPE"
              className="custom-dropdown"
            >
              {ProjectSubTypes.map((ProjectSubType) => (
                <Option key={ProjectSubType} value={ProjectSubType}>
                  {ProjectSubType}


                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="fps"
            label="FPS"
            rules={[
              { required: true, message: "Please enter the fps!" },
              { type: "number", min: 1, message: "FPS must be a number!" },
            ]}
          >
            <InputNumber />
          </Form.Item>
          <Form.Item
            name="colorspace"
            label="Color Space"
            rules={[
              { required: true, message: "Please enter the color space!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="resolution"
            label="Resolution"
            rules={[
              { required: true, message: "Please enter the resolution!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="departments"
            label="Departments"
            rules={[
              { required: true, message: "Please enter your department!" },
            ]}
          >
            <Select
              placeholder="SELECT DEPARTMENT"
              mode="multiple"
              className="custom-dropdown"
            >
              {departments.map((department) => (
                <Option key={department} value={department}>
                  {department}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create Project
            </Button>
          </Form.Item>
        </Form>
         )}

         {formMode === 'update' && (
        <Form onFinish={handleUpdateProject} form={updateForm} layout="horizontal">

        <div style={{ display: "flex", flexDirection: "column" }}>
            <Form.Item
              name="project"
              label="Project"
              rules={[{ required: true, message: "Please enter project!" }]}
            >
              <Select
                placeholder="SELECT PROJECT"
                className="custom-dropdown"
                onChange={handleProjectChange}
              

              >
                {projects.map((project) => (
                  <Option key={project} value={project}>
                    {project}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button
                className="fetch-button"
                type="primary"
          
                onClick={ () => handleFetch(selectedProjectValue)} 
                loading={loading}
                style={{ width: "130px", padding: 0 }}
              >
                Fetch Project Data
              </Button>
            </Form.Item>
          </div>

          <Form.Item
            name="project_name"
            label="Project Name"
            rules={[
              { required: true, message: "Please enter the project name!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="project_code"
            label="Project Code"
            rules={[
              { required: true, message: "Please enter the project code!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="project_type"
            label="Project Type"
            rules={[{ required: true, message: "Please enter project type!" }]}
          >
            <Select
              placeholder="SELECT PROJECT TYPE"
              className="custom-dropdown"

            >
              {ProjectTypes.map((ProjectType) => (
                <Option key={ProjectType} value={ProjectType}>
                  {ProjectType}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="project_sub_type"
            label="Project Sub Type"
            rules={[
              { required: true, message: "Please enter project sub type!" },
            ]}
          >
            <Select
              placeholder="SELECT PROJECT SUB TYPE"
              className="custom-dropdown"
            >
              {ProjectSubTypes.map((ProjectSubType) => (
                <Option key={ProjectSubType} value={ProjectSubType}>
                  {ProjectSubType}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="fps"
            label="FPS"
            rules={[
              { required: true, message: "Please enter the fps!" },
              { type: "number", min: 1, message: "FPS must be a number!" },
            ]}
          >
            <InputNumber />
          </Form.Item>

          <Form.Item
       name="lock"
       valuePropName="checked"
       label="Lock"
       rules={[{ required: true, message: "Please specify the lock status!" }]}
       >
            <Checkbox></Checkbox>
       </Form.Item>
          <Form.Item
            name="colorspace"
            label="Color Space"
            rules={[
              { required: true, message: "Please enter the color space!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="resolution"
            label="Resolution"
            rules={[
              { required: true, message: "Please enter the resolution!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="departments"
            label="Departments"
            rules={[
              { required: true, message: "Please enter your department!" },
            ]}
          >
            <Select placeholder="SELECT DEPARTMENTS"  mode="multiple" className="custom-dropdown">
              {departments.map((department) => (
                <Option key={department} value={department}>
                  {department}
                </Option>
              ))}
            </Select>
          </Form.Item>
         
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Update Project
            </Button>
          </Form.Item>
        
        </Form>
      )}
    </div>
  );
};

export default CreateProjectForm;
