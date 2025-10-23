import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import CreateAndUpdateUserForm from "./CreateAndUpdateUserForm";
import CreateProjectForm from "./CreateProjectForm";
import "./UserForm.css";
import TemplateForMandays from "./TemplateForManDays";
import GenerateExcelTemplateBid from "./GenerateExcelTemplateBid";
const UserForm = () => {
  return (
    <div className="container">
      <div className="forms"
       
      >
        <CreateAndUpdateUserForm  />

        <CreateProjectForm  />
      </div>

      <div className="templates">
        <TemplateForMandays />
        <GenerateExcelTemplateBid />
      </div>
    </div>
  );
};

export default UserForm;
