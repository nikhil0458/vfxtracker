import { Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import {
  AppstoreOutlined,
  ContainerOutlined,
  DesktopOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  HomeOutlined,
  MailOutlined,
  FileTextOutlined,


} from "@ant-design/icons";


const MenuList = ({ darkTheme,sidebarFrozen }) => {
  const { logout, user } = useAuth();

  const designation = user?.designation;

  const location = useLocation();
  const currentPath = location.pathname;

  const selectedKey = currentPath.split("/")[2] || "home";





  return (
<div
  style={{
    pointerEvents: sidebarFrozen ? "none" : "auto",
    opacity: sidebarFrozen ? 0.5 : 1,
  }}
>
    <Menu
      theme={darkTheme ? "dark" : "light"}
      mode="inline"
      className="menu-bar"
      selectedKeys={[selectedKey]}
      disabled={sidebarFrozen}
    >

      <Menu.Item key="home" icon={<HomeOutlined />}>
        <Link to="/app/home">Home</Link>
      </Menu.Item>





      {designation === "Supervisor" && (
        <>

      {(user.department !== "asset")&&(


<>
<Menu.Item key="bidding" icon={<MenuFoldOutlined />}>
        <Link to="/app/bidding">Shot Bidding</Link>
      </Menu.Item>



          <Menu.Item key="Shots"  icon={<MenuFoldOutlined />}>
            <Link to="/app/Shots"  onClick={(e)=> {
              handleShotsGlobalClick();
            }}>Shots</Link>

          </Menu.Item>
          <Menu.Item key="tasks" icon={<ContainerOutlined />}>
        <Link to="/app/tasks">Shot Tasks</Link>
      </Menu.Item>


     <Menu.Item key="shots_review" icon={<ContainerOutlined />}>
        <Link to="/app/shots_review">Shots Review</Link>
      </Menu.Item>

</>
          )}



{(user.department === "asset"  ) && (
      <>
        <Menu.Item key="asset_bidding" icon={<ContainerOutlined />}>
          <Link to="/app/asset_bidding">Asset Bidding</Link>
        </Menu.Item>

        <Menu.Item key="assets_tasks" icon={<ContainerOutlined />}>
          <Link to="/app/assets_tasks">Assets Tasks</Link>
        </Menu.Item>

        <Menu.Item key="assets_review" icon={<ContainerOutlined />}>
          <Link to="/app/assets_review">Assets Review</Link>
        </Menu.Item>
      </>
    )}


          <Menu.Item key="reports" icon={<FileTextOutlined />}>
            <Link to="/app/reports">Reports</Link>
          </Menu.Item>




        </>
      )}


      {designation === "Manager" && (

  <>
    {(user.department !== "asset") && (
        <>

   <Menu.Item key="bidding" icon={<MenuFoldOutlined />}>
        <Link to="/app/bidding">Shot Bidding</Link>
      </Menu.Item>




          <Menu.Item key="Shots" icon={<MenuFoldOutlined />}  >
            <Link to="/app/Shots"  onClick={(e)=> {
              handleShotsGlobalClick();
            }}>Shots</Link>
          </Menu.Item>

          <Menu.Item key="tasks" icon={<ContainerOutlined />}>
        <Link to="/app/tasks">Shot Tasks</Link>
      </Menu.Item>

      <Menu.Item key="shots_review" icon={<ContainerOutlined />}>
        <Link to="/app/shots_review">Shots Review</Link>

      </Menu.Item>
      </>
          )}

     {(user.department === "asset" || user.department === "Prod") && (
      <>
        <Menu.Item key="asset_bidding" icon={<ContainerOutlined />}>
          <Link to="/app/asset_bidding">Asset Bidding</Link>
        </Menu.Item>

        <Menu.Item key="assets_tasks" icon={<ContainerOutlined />}>
          <Link to="/app/assets_tasks">Assets Tasks</Link>
        </Menu.Item>

        <Menu.Item key="assets_review" icon={<ContainerOutlined />}>
          <Link to="/app/assets_review">Assets Review</Link>
        </Menu.Item>
      </>
    )}





      <Menu.Item key="reports" icon={<FileTextOutlined />}>
            <Link to="/app/reports">Reports</Link>
          </Menu.Item>

          <Menu.Item key="get_project_reports" icon={<FileTextOutlined />}>
                 <Link to="/app/get_project_reports">Project-Report</Link>
          </Menu.Item>



          <Menu.Item key="UserForm" icon={<DesktopOutlined />}>
            <Link to="/app/UserForm">Utils</Link>
          </Menu.Item>






       </>
      )}












      {designation === "Team Leader" && (

        <>


{(user.department !== "asset") && (
 <>
  <Menu.Item key="bidding" icon={<MenuFoldOutlined />}>
        <Link to="/app/bidding">Shot Bidding</Link>
      </Menu.Item>
          <Menu.Item key="Shots" icon={<MenuFoldOutlined />}>
            <Link to="/app/Shots"  onClick={(e)=> {
              handleShotsGlobalClick();
            }}>Shots</Link>
          </Menu.Item>

          <Menu.Item key="tasks" icon={<ContainerOutlined />}>
        <Link to="/app/tasks">Shot Tasks</Link>
      </Menu.Item>


      <Menu.Item key="shots_review" icon={<ContainerOutlined />}>
        <Link to="/app/shots_review">Shots Review</Link>
      </Menu.Item>

     </>
          )}


{(user.department === "asset") && (
      <>
        <Menu.Item key="asset_bidding" icon={<ContainerOutlined />}>
          <Link to="/app/asset_bidding">Asset Bidding</Link>
        </Menu.Item>

        <Menu.Item key="assets_tasks" icon={<ContainerOutlined />}>
          <Link to="/app/assets_tasks">Assets Tasks</Link>
        </Menu.Item>

        <Menu.Item key="assets_review" icon={<ContainerOutlined />}>
          <Link to="/app/assets_review">Assets Review</Link>
        </Menu.Item>
      </>
    )}









          <Menu.Item key="reports" icon={<FileTextOutlined/>}>
            <Link to="/app/reports">Reports</Link>
          </Menu.Item>




        </>
      )}

        {(designation === "Artist") &&(
          <>
           {(user.department === "asset")&& (
            <>
        <Menu.Item key="assets_tasks" icon={<ContainerOutlined />}>
        <Link to="/app/assets_tasks">Assets Tasks</Link>
      </Menu.Item>
      </>
           )}


{(user.department !== "asset")&& (
            <>
          <Menu.Item key="tasks" icon={<ContainerOutlined />}>
        <Link to="/app/tasks">Shot Tasks</Link>
      </Menu.Item>

      </>
           )}
</>
        )}

    </Menu>
    </div>
  );
};

export default MenuList;
