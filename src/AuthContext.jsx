import React, { createContext, useContext,useState, useEffect } from 'react';
import { ip_port } from './Configs'; 
const AuthContext = createContext();

const fetchAdditionalData = async (accessToken) => {
  console.log("working__accessTOken",accessToken)
  try {
    const response = await fetch(`http://${ip_port}/config/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        
      },
    });
    console.log("repsonseeemainstatus", response.status)

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error:", errorText);
      return null;
    }
    const data = await response.json();
    console.log("fetchAdditionalDataaa",data)
  
    return data;
  } catch (error) {
    console.error('Failed to fetch additional data:', error);
    return null;
  }
};

const processFetchedData = (data, keys) => {
  console.log("dataprocess",data, "keys", keys )
  return data.map(item => {
    const filteredItem = {};
    keys.forEach(key => {
      if (item.hasOwnProperty(key)) {
        filteredItem[key] = item[key];
      }
    });
   console.log("filteredItemm", filteredItem)
    return filteredItem;

  });
};

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken'));
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [userControls, setUserControls] = useState(() => JSON.parse(localStorage.getItem('userControls')));
  const [filteredData, setFilteredData] = useState(() => JSON.parse(localStorage.getItem('filteredData')));
  const [designation, setDesignation] = useState(() => localStorage.getItem('designation'));

  useEffect(() => {
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    if (user) localStorage.setItem('user', JSON.stringify(user));
    if (userControls) localStorage.setItem('userControls', JSON.stringify(userControls));
    if (filteredData) localStorage.setItem('filteredData', JSON.stringify(filteredData));
    if (designation) localStorage.setItem('designation', designation);
  }, [accessToken, refreshToken, user, userControls, filteredData, designation]);

  


  const login = async (userData) => {
    try{
   console.log("userdataaa", userData)
    localStorage.clear();
    const { accessToken, refreshToken, designation, controls, ...rest } = userData;
    console.log("rest",userData)
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setDesignation(designation);
    // setUser({ userData });
    console.log("upd user data",{ designation, ...rest });
    setUser({ designation, controls,...rest });
    
    setUserControls(eval(controls));

    const fetchedData = await fetchAdditionalData(accessToken);
    console.log("fetcheddd_Data",fetchedData)
    
    if (fetchedData) {
      const processedData = processFetchedData(fetchedData, ['bid_macro', 'bid_micro', 'base_columns', 'bid_le_columns', 'bid_days_columns', 'bid_cmplx_columns']);
      setFilteredData(processedData);
      console.log("processedData", processedData)
      
      
    } else {
      setFilteredData(null);
    }
  }catch(error){
    console.error("Error during login:", error);
  }
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    setUserControls(null);
    setFilteredData(null);
    localStorage.clear();
    window.shotUpdated = false;

  };

  return (
    <AuthContext.Provider value={{ accessToken, refreshToken, user, userControls, designation, filteredData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
