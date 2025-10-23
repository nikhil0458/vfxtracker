import axios from "axios";
import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, message ,notification} from "antd";
import { useAuth } from "./AuthContext";
import { ip_port } from './Configs'; 


import "./UserForm.css";

const { Option } = Select;

const CreateAndUpdateUserForm = () => {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [formMode, setFormMode] = useState("create");
  const [departments, setDepartments] = useState([]);
  const [controls, setControls] = useState([]);
  const [fetchInputValue, setFetchInputValue] = useState("");
  const [selectedDesignation, setSelectedDesignation] = useState("")

  const fetchUserData = async (empId) => {
    try {
      const response = await axios.get(
        `http://${ip_port}/employees/${empId}/`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  };

  const updateUserData = async (userData) => {
    try {
      const response = await axios.patch(
        `http://${ip_port}/employees/${userData.emp_id}/`,
        userData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating user data:", error);
      throw error;
    }
  };

  const createUserData = async (userData) => {
    console.log('userData=',userData)
    try {
      const response = await axios.post(
        
        `http://${ip_port}/employees/create/`,
        userData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.statusText);
      console.log("user_created_data",response.data)
      return response.data;

    } catch (error) {
      console.error("Error creating user data:", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const departmentResponse = await axios.get(
          `http://${ip_port}/departments/`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        setDepartments(departmentResponse.data);

        const controlsResponse = await axios.get(
          `http://${ip_port}/departments/`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        let controls = controlsResponse.data;
        controls.unshift("All");
        console.log("controls", controlsResponse.data);
        setControls(controls);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
        message.error("Failed to load dropdown options.");
      }
    };

    fetchDropdownData();
  }, [accessToken]);

  const handleFetch = async () => {
    const empId = updateForm.getFieldValue("emp_id");
    setLoading(true);
    try {
      const userData = await fetchUserData(empId, accessToken);
      eval(userData.controls)
      console.log("userData",userData.controls, typeof(eval(userData.controls)))
      const controlsArray = Array.isArray(eval(userData.controls))
        ? userData.controls
        : [];
        console.log("controlsArray",controlsArray, )
      updateForm.setFieldsValue({
        emp_id: userData.emp_id,
        emp_name: userData.emp_name,
        pc_name: userData.pc_name,
        department: userData.department,
        designation: userData.designation,
        controls: eval(controlsArray),
      });
      // message.success("User data fetched successfully!");
      notification.success({ description:"User data fetched successfully"});
      
    } catch (error) {
      console.error("Error fetching user data:", error);
      notification.error({
        description: "Failed to fetch user data.", 
      })
      // message.error("Failed to fetch user data.");
    }
    setLoading(false);
  };

  const handleUpdate = async (values) => {
    if (values.controls.includes("All")) values.controls = departments;
    setLoading(true);
    try {
      await updateUserData(values, accessToken);
      // message.success("User data updated successfully!");
      notification.success({
        description: "User data updated successfully"
      })
      updateForm.resetFields()
      setFetchInputValue("");
    } catch (error) {
      console.error("Error updating user data:", error);
      notification.error({description:
        "Failed to Update User Data."
      })
      // message.error("Failed to Update User Data.");
    }
    setLoading(false);
  };

  const handleCreate = async (values) => {
    values.password = "1234";
    if (values.controls.includes("All")) values.controls = departments;
   
    setLoading(true);
    try {
     
      const response = await createUserData(values, accessToken);
       
    if (response ) {
      // message.success("User created successfully!");
      notification.success({
        description:"User created successfully!"
      })
      createForm.resetFields();
    } else {
      notification.error({description: "Failed to Create User"})
      // message.error("Failed to Create User.");

    }
    } catch (error) {
        console.error("Error creating user:", error);
      if (error.response && error.response.status === 500) {
        // message.error("Employee ID already exists.");
        notification.error({description:"Employee ID already exists."})
      } else {
        // message.error("Failed to Create User.");
        notification.error({description: "Failed to Create User."})
      }
    }

    setLoading(false);
  };

  const handleFormSwitch = (mode) => {
    setFormMode(mode);
    if (mode === "create") {
      createForm.resetFields();
    } else {
      updateForm.resetFields();
    }
  };
  const handleFormChange = (changedValues) => {
    if (changedValues.designation) {
      setSelectedDesignation(changedValues.designation);
      // Optionally reset controls if designation changes to Artist
      if (changedValues.designation === "Artist") {
        createForm.setFieldsValue({ controls: [] });
      }
    }
  };
  return (
    <div className="form-containers" style={{margin:"40px"}}>
      <h1 className="heading" style={{color:"grey"}}>
        {formMode === "create" ? "Create User" : "Update User Data"}
      </h1>
      <div style={{ marginBottom: "20px" }}>
        <Button
          type={formMode === "create" ? "primary" : "default"}
          onClick={() => handleFormSwitch("create")}
        >
          Create
        </Button>
        <Button
          type={formMode === "update" ? "primary" : "default"}
          onClick={() => handleFormSwitch("update")}
          style={{ marginLeft: "16px" }}
        >
          Update
        </Button>
      </div>

      {formMode === "create" && (
        <Form form={createForm} onFinish={handleCreate}  onValuesChange={handleFormChange} layout="horizontal">
          <Form.Item
            name="emp_id"
            label="Employee ID"
            rules={[
              { required: true, message: "Please enter your employee ID!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="emp_name"
            label="Employee Name"
            rules={[
              { required: true, message: "Please enter your employee name!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="pc_name"
            label="PC Name"
            rules={[{ required: true, message: "Please enter your PC name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="department"
            label="Department"
            rules={[
              { required: true, message: "Please enter your department!" },
            ]}
          >
            <Select placeholder="SELECT DEPARTMENT" className="custom-dropdown">
              {departments.map((department) => (
                <Option key={department} value={department}>
                  {department}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="designation"
            label="Designation"
            rules={[
              { required: true, message: "Please enter your designation!" },
            ]}
          >
            <Select
              placeholder="SELECT DESIGNATION"
              className="custom-dropdown"
            >
              <Option value="Artist">Artist</Option>
              <Option value="TeamLead">TeamLead</Option>
              <Option value="Supervisor">Supervisor</Option>
              <Option value="Manager">Manager</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="controls"
            label="Controls"
            rules={[
              {
                validator: (_, value) => {
                  const isValid = Array.isArray(value);
                  return isValid
                    ? Promise.resolve()
                    : Promise.reject(new Error("Please enter valid controls!"));
                },
              },
            ]}
          >
            <Select
              placeholder="SELECT CONTROLS"
              mode="multiple"
              style={{ width: "100%" }}
              disabled={selectedDesignation === "Artist"}
            >
              {controls.map((control) => (
                <Option key={control} value={control}>
                  {control}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create
            </Button>
          </Form.Item>
        </Form>
      )}

      {formMode === "update" && (
        <Form form={updateForm} onFinish={handleUpdate} layout="horizontal">
          <Form.Item
            name="emp_id"
            label="Employee ID"
            rules={[
              { required: true, message: "Please enter your employee ID!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="emp_name"
            label="Employee Name"
            rules={[
              { required: true, message: "Please enter your employee name!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="pc_name"
            label="PC Name"
            rules={[{ required: true, message: "Please enter your PC name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="department"
            label="Department"
            rules={[
              { required: true, message: "Please enter your department!" },
            ]}
          >
            <Select placeholder="SELECT DEPARTMENT" className="custom-dropdown">
              {departments.map((department) => (
                <Option key={department} value={department}>
                  {department}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="designation"
            label="Designation"
            rules={[
              { required: true, message: "Please enter your designation!" },
            ]}
          >
            <Select
              placeholder="SELECT DESIGNATION"
              className="custom-dropdown"
            >
              <Option value="Artist">Artist</Option>
              <Option value="TeamLead">TeamLead</Option>
              <Option value="Supervisor">Supervisor</Option>
              <Option value="Manager">Manager</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="controls"
            label="Controls"
            rules={[
              {
                validator: (_, value) => {
                  const isValid = Array.isArray(value);
                  return isValid
                    ? Promise.resolve()
                    : Promise.reject(new Error("Please enter valid controls!"));
                },
              },
            ]}
          >
            <Select
              placeholder="SELECT CONTROLS"
              mode="multiple"
              style={{ width: "100%" }}
            >
              {controls.map((control) => (
                <Option key={control} value={control}>
                  {control}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {/* <Form.Item>
            <Button onClick={handleFetch} type="primary" style={{ marginBottom: '16px' }} loading={loading}>
              Fetch User Data
            </Button>
          </Form.Item> */}
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Update
            </Button>
          </Form.Item>
          <Form.Item>
            <Input
              id="fetch"
              value={fetchInputValue}
              className="fetch-input"
              placeholder="Enter Employee ID "
              onChange={(e) =>{
                setFetchInputValue(e.target.value);
                updateForm.setFieldsValue({ emp_id: e.target.value })
              }}
            />
            <Button
              className="fetch-button"
              type="primary"
              onClick={handleFetch}
              loading={loading}
              style={{ marginLeft: "16px" }}
            >
              Fetch User Data
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

export default CreateAndUpdateUserForm;
