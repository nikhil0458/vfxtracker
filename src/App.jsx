import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { Button, Layout, theme, ConfigProvider, Row, Col } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import Logo from "./components/Logo";
import MenuList from "./components/MenuList";
import Content from "./Content";
import ToggleThemeButton from "./components/ToggleThemeButton";
import Login from "./Login";
import { AuthProvider, useAuth } from "./AuthContext";
import Work from "./Work";
import "antd/dist/reset.css";
import Shots from "./Shots";
import Reports from "./Reports";
import Logout from "./Logout";
import UserForm from "./UserForm";
import Bidding from "./Bidding";
import Tasks from "./Tasks";
import Home from "./Home";
import ShotsReview from "./ShotsReview";
import AssetBidding from "./AssetBidding";
import AssetsTasks from "./AssetsTasks";
import AssetsReview from "./AssetsReview";
import GetProjectReports from "./GetProjectReports";
import Testing from "./Testing";
import { ip_port } from "./Configs";
import { connectWebSocket } from "./WebSocketManager";

// import { dataToken, radioButtonValue, openedFilePath } from "./Login";
// import {
//   getDataToken,
//   getRadioButtonValue,
//   getOpenedFilePath
// } from "./WebSocketManager"
// import ReportsType from './ReportsType'
// import { useLocation } from 'react-router-dom';
// import ProjectReports from "./ProjectReports";

import { handlePostLogin } from "./utils";

const { Header, Sider, Content: AntContent } = Layout;

function AppLayout() {
  // useEffect(() => {
  //   connectWebSocket();
  // }, []);

  const { user, accessToken, logout } = useAuth();
  // const {logout} = useAuth();
  // const hasShownNoTaskModal = useRef(false);
  // const hasShownErrorModal = useRef(false);
  const navigate = useNavigate();
  const [desktopStatus, setDesktopStatus] = useState("");

  useEffect(() => {
    // Set initial state from global if available
    if (window.desktopStatus) {
      setDesktopStatus(window.desktopStatus);
    }
  }, []);
  const [sidebarFrozen, setSidebarFrozen] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (user && accessToken && !window.shotUpdated) {
      console.log("🚀 Checking for WIP tasks...");
      handlePostLogin(user, accessToken, ip_port);
    }
  }, [user, accessToken, ip_port]);

  useEffect(() => {
    const handleWipTaskStatusChange = () => {
      console.log("🔄 Received WIP task status change event.");

      // if (desktopStatus === "work" && !intervalRef.current) {
      //   console.log("🔁 Restarting timer after WIP task was added.");
      //   startTimer();
      // }
    };

    window.addEventListener("wipTaskStatusChange", handleWipTaskStatusChange);
    return () =>
      window.removeEventListener(
        "wipTaskStatusChange",
        handleWipTaskStatusChange
      );
  }, [desktopStatus, user, accessToken]);

  // useEffect(() => {
  //   if (
  //     user &&
  //     accessToken &&
  //     desktopStatus === "work" &&
  //     !intervalRef.current
  //   ) {
  //     console.log("⏳ Starting timer from login + work mode...");
  //     startTimer();
  //   }
  // }, [user, accessToken, desktopStatus]);

  // const startTimer = () => {
  //   if (intervalRef.current) return;

  //   const timerCallback = async () => {
  //     console.log("⏱ 1 min passed. Checking WIP tasks...");
  //     await handlePostLogin(user, accessToken, ip_port);

  //     // if no WIP task exists, stop timer
  //     if (window.hasWipTask === false) {
  //       console.log("❌ No WIP task, stopping timer.");
  //       stopTimer();
  //     }
  //   };

  //   intervalRef.current = setInterval(timerCallback, 60000);
  //   timerCallback();
  // };

  // const stopTimer = () => {
  //   if (intervalRef.current) {
  //     clearInterval(intervalRef.current);
  //     intervalRef.current = null;
  //     console.log("✅ Timer stopped.");
  //   }
  // };

  useEffect(() => {
    const handleStatusChange = (e) => {
      console.log("e", e);
      console.log("📩 Received WebSocket event:", e.detail);
      if (!e.detail || typeof e.detail !== "string") {
        console.warn("⚠️ statusChange event has invalid or missing detail");
        return;
      }

      const newStatus = e.detail.toLowerCase();
      console.log("⚡ Status event received in App.jsx:", newStatus);

      window.desktopStatus = newStatus;
      setDesktopStatus(newStatus);

      // if (newStatus === "work" && !intervalRef.current) {
      //   startTimer();
      // } else if (newStatus !== "work" && intervalRef.current) {
      //   stopTimer();
      // }
      // setSidebarFrozen(newStatus === "idle"); // freeze sidebar on idle
      setSidebarFrozen(!["work", "prod_sup"].includes(newStatus));
    };

    window.addEventListener("statusChange", handleStatusChange);
    return () => window.removeEventListener("statusChange", handleStatusChange);
  }, []);

  // useEffect(() => {
  //   console.log("🧠 desktopStatus now:", desktopStatus);
  //   if (desktopStatus === "work") {
  //     console.log("accesss",accessToken)
  //     console.log("▶️ Starting timer...");
  //     startTimer();
  //   } else  {
  //     console.log("⏹ Stopping timer...");
  //     stopTimer(); // on "idle" or anything else
  //   }
  // }, [desktopStatus]);

  useEffect(() => {
    const handleForceLogout = () => {
      console.log("🔁 Received wsForceLogout event");
      logout();
      window.location.href = "/login";
    };

    window.addEventListener("wsForceLogout", handleForceLogout);
    return () => window.removeEventListener("wsForceLogout", handleForceLogout);
  }, [logout]);

  // ... rest of your Login component

  // useEffect(() => {
  //   const status = window.desktopStatus;

  //   if (status === "idle") {
  //     navigate ("/locked", { replace: true });
  //   }
  // }, [navigate]);

  const [darkTheme, setDarkTheme] = useState(
    () => JSON.parse(localStorage.getItem("darkTheme")) ?? true
  );
  const [collapsed, setCollapsed] = useState(false);

  const toggleTheme = () => {
    const newTheme = !darkTheme;
    setDarkTheme(newTheme);
    localStorage.setItem("darkTheme", JSON.stringify(newTheme));
  };

  const { darkAlgorithm, defaultAlgorithm } = theme;
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const commonBackgroundColor = darkTheme ? "#001529" : "#ffffff";

  const iconColor = darkTheme ? "#ffffff" : "#000000";

  return (
    <ConfigProvider
      theme={{ algorithm: darkTheme ? darkAlgorithm : defaultAlgorithm }}
    >
      <div className={darkTheme ? "dark-theme" : "light-theme"}>
        <Layout>
          <Sider
            collapsed={collapsed}
            // collapsible
            collapsible={!sidebarFrozen}
            trigger={null}
            // trigger={undefined}
            // theme={darkTheme}
            theme={darkTheme ? "dark" : "light"}
            // className="sidebar"
            className={`sidebar ${sidebarFrozen ? "sidebar-frozen" : ""}`}
          >
            <Logo collapsed={collapsed}>VFX</Logo>

            <MenuList
              darkTheme={darkTheme}
              currentPath={location.pathname}
              sidebarFrozen={sidebarFrozen}
            ></MenuList>

            <ToggleThemeButton
              darkTheme={darkTheme}
              toggleTheme={toggleTheme}
            />
          </Sider>
          <Layout>
            <Header style={{ padding: 0, background: commonBackgroundColor }}>
              <Button
                type="text"
                className="toggle"
                onClick={() => setCollapsed(!collapsed)}
                icon={
                  collapsed ? (
                    <MenuUnfoldOutlined style={{ color: iconColor }} />
                  ) : (
                    <MenuFoldOutlined style={{ color: iconColor }} />
                  )
                }
              />
            </Header>

            <Layout>
              <AntContent
                style={{
                  padding: "50px",

                  overflowY: "auto",

                  height: "calc(100vh - 64px)",
                  // background: colorBgContainer

                  // backgroundColor:"#001529"
                  // backgroundColor:"#152238"
                }}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={24} md={24} lg={24}>
                    <Routes>
                      {/* <Route path="/home" element={<Content title={"My Home"} />} /> */}
                      <Route
                        path="/home"
                        element={
                          <PrivateRoute
                            requiredRole={[
                              "Manager",
                              "Team Leader",
                              "Supervisor",
                              "Artist",
                            ]}
                          >
                            <Home darkTheme={darkTheme} />
                          </PrivateRoute>
                        }
                      />
                      {/* <Route path="/testing" element={<PrivateRoute requiredRole={["Manager","Team Leader","Supervisor","Artist"]}><Testing darkTheme={darkTheme}/></PrivateRoute>} /> */}

                      <Route
                        path="/bidding"
                        element={
                          <PrivateRoute
                            requiredRole={[
                              "Manager",
                              "Team Leader",
                              "Supervisor",
                            ]}
                          >
                            <Bidding />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/work"
                        element={
                          <PrivateRoute
                            requiredRole={[
                              "Manager",

                              "Supervisor",
                              "Team Leader",
                            ]}
                          >
                            <Work />
                          </PrivateRoute>
                        }
                      />
                      {/* <Route path="/shots" element={<Shots/>}/> */}
                      <Route
                        path="/shots"
                        element={
                          <PrivateRoute
                            requiredRole={[
                              "Manager",
                              "Team Leader",
                              "Supervisor",
                            ]}
                          >
                            <Shots darkTheme={darkTheme} />
                          </PrivateRoute>
                        }
                      />

                      <Route
                        path="/shots_review"
                        element={
                          <PrivateRoute
                            requiredRole={[
                              "Manager",
                              "Team Leader",
                              "Supervisor",
                            ]}
                          >
                            <ShotsReview darkTheme={darkTheme} />
                          </PrivateRoute>
                        }
                      />

                      {/* <Route path="/asset_bidding" element={<PrivateRoute
                   requiredRole={["Manager","Team Leader","Supervisor"]}
                   ><AssetBidding darkTheme={darkTheme}/></PrivateRoute>} />
               */}

                      {/* {(user.department === "asset" &&   ["Manager", "Team Leader", "Supervisor"].includes(user?.designation)  )  && ( */}
                      <>
                        <Route
                          path="/assets_tasks"
                          element={
                            <PrivateRoute
                            //  requiredRole={["Manager","Team Leader","Supervisor","Artist"]}
                            >
                              <AssetsTasks darkTheme={darkTheme} />
                            </PrivateRoute>
                          }
                        />

                        <Route
                          path="/asset_bidding"
                          element={
                            <PrivateRoute
                            // requiredRole={["Manager","Team Leader","Supervisor"]}
                            >
                              <AssetBidding darkTheme={darkTheme} />
                            </PrivateRoute>
                          }
                        />

                        <Route
                          path="/assets_review"
                          element={
                            <PrivateRoute
                            // requiredRole={["Manager","Team Leader","Supervisor"]}
                            >
                              <AssetsReview darkTheme={darkTheme} />
                            </PrivateRoute>
                          }
                        />
                      </>
                      {/* )} */}

                      {/* <Route path="/assets_review" element={<PrivateRoute
                   requiredRole={["Manager","Team Leader","Supervisor"]}
                   ><AssetsReview darkTheme={darkTheme}/></PrivateRoute>} /> */}
                      {/* {(user.department === "asset" &&   user?.designation === "Artist")&&( */}
                      <Route
                        path="/assets_tasks"
                        element={
                          <PrivateRoute
                            requiredRole={[
                              "Manager",
                              "Team Leader",
                              "Supervisor",
                              "Artist",
                            ]}
                          >
                            <AssetsTasks darkTheme={darkTheme} />
                          </PrivateRoute>
                        }
                      />

                      {/* )} */}
                      <Route
                        path="/UserForm"
                        element={
                          <PrivateRoute requiredRole={["Manager"]}>
                            <UserForm />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/reports"
                        element={
                          <PrivateRoute
                            requiredRole={[
                              "Manager",
                              "Team Leader",

                              "supervisor",
                            ]}
                          >
                            <Reports />
                          </PrivateRoute>
                        }
                      />

                      {/* <Route path="/tasks" element={<Tasks darkTheme={darkTheme}/>}/> */}
                      {/* {(user?.department !== "asset"  &&  user?.designation === "Manager") &&( */}
                      <Route
                        path="/tasks"
                        element={
                          <PrivateRoute
                            requiredRole={[
                              "Manager",
                              "Team Leader",
                              "Supervisor",
                              "Artist",
                            ]}
                          >
                            <Tasks darkTheme={darkTheme} />
                          </PrivateRoute>
                        }
                      />
                      {/* )} */}

                      {/* <Route path="/project_reports" element={<ProjectReports />} /> */}
                      <Route
                        path="/get_project_reports"
                        element={<GetProjectReports darkTheme={darkTheme} />}
                      />

                      {/* <Route path="/logout" element={<Logout />} /> */}
                      {/* <Route
                path="/locked"
                 element={
                     <div style={{ padding: "50px", textAlign: "center" }}>
                      <h1>🔒 Idle Mode </h1>
                    <p>The application is in idle mode. Please switch to "Work" mode from the desktop app.</p>
                    </div>
                     }
/> */}
                    </Routes>
                  </Col>
                </Row>
              </AntContent>
            </Layout>
          </Layout>
        </Layout>
      </div>
    </ConfigProvider>
  );
}

const PrivateRoute = ({ children, requiredRole }) => {
  const { accessToken, user } = useAuth();
  const status = window.desktopStatus;
  if (!accessToken) {
    return <Navigate to="/login" />;
  }

  if (status === "idle") {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <h1>🔒 Idle Mode</h1>
        <p>You are in Idle Mode. Navigation is restricted.</p>
      </div>
    );
  }

  if (requiredRole && !requiredRole.includes(user?.designation)) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <h1>Error</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  return children;
};

const ProtectedAppRoute = () => {
  return <AppLayout />;
};

const App = () => (
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/logout" element={<Logout />} />
        {/* <Route path="/app/*" element={<AppLayout />} /> */}
        <Route path="/app/*" element={<ProtectedAppRoute />} />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  </AuthProvider>
);

// const AppWithWebSocket = () => {
//   useEffect(() => {
//     connectWebSocket(); // connect once, before anything renders
//   }, []);

//   return <App />;
// };

export default App;
// export default AppWithWebSocket;
