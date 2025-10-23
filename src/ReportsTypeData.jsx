import {
  PieChart,
  BarChart,
  Pie,
  Tooltip,
  Cell,
  XAxis,
  YAxis,
  Bar,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Dropdown,
  Menu,
  
  Button,
  message,
  Table,
  Alert,
  Row,
  Col,
  DatePicker,
} from "antd";


const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export const PieChartComponent = ({ data }) => (
  <ResponsiveContainer width="100%" height={400}>
    <PieChart>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={150} 
        label={({ name, value }) => `${value}`}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
);

const generateColor = (index, total, hueOffset = 0) => {
  const hue = ((index / total) * 360 + hueOffset) % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

const processDataWithColors = (data, hueOffset) => {
  return data.map((entry, index) => ({
    ...entry,
    fill: generateColor(index, data.length, hueOffset),
  }));
};

// const processDataWithColors = (data = [], hueOffset) => {
//     if (!Array.isArray(data)) {
//       console.error("Data passed to BarChartComponent is not an array:", data);
//       return [];
//     }
//     return data.map((entry, index) => ({
//       ...entry,
//       fill: generateColor(index, data.length, hueOffset)
//     }));
//   };

export const BarChartComponent = (data, title, hueOffset) => (
  <div
    className="bar-chart-container"
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      // gap: '10px',
      width: "100%",
      maxWidth: "600px",
      margin: "0 auto",
      padding: "10px",
    }}
  >
    <h3
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 50,
        marginTop: 50,
        textDecoration: "underline",
        fontSize: "22px",
        fontWeight: "bold",
      }}
    >
      {title}
    </h3>
    <ResponsiveContainer width="90%" aspect={1}>
      <BarChart data={processDataWithColors(data, hueOffset)}>
        <XAxis
          dataKey="name"
          stroke="#000" // Change color of the axis line
          tick={{ fontWeight: "bold", fontSize: 16 }}
          axisLine={{ strokeWidth: 2 }}
        />
        <YAxis
          stroke="#000"
          tick={{ fontWeight: "bold", fontSize: 16 }}
          axisLine={{ strokeWidth: 2 }}
        />
        <Tooltip />

        <Bar
          dataKey="value"
          fill={(entry) => entry.fill}
          barSize={60}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>

    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        marginTop: "30px",
        paddingTop: "0",
      }}
    >
      {data.map((entry, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            marginRight: "15px",
            marginBottom: "5px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: generateColor(index, data.length, hueOffset),
              marginRight: "5px",
            }}
          />
          <span
            style={{ fontSize: "14px", fontWeight: "bold" }}
          >{`${entry.name}: ${entry.value}`}</span>
        </div>
      ))}
    </div>
  </div>
);

const columns = [
  // { title: "_id", dataIndex: "_id", key: "_id" },
  {
    title: "Employee Name",
    dataIndex: "emp_name",
    key: "emp_name",
    fixed: "left",
  },
  { title: "Employee ID", dataIndex: "emp_id", key: "emp_id" },
  { title: "Department", dataIndex: "department", key: "department" },
  { title: "Date", dataIndex: "date", key: "date" },
  { title: "Login Time", dataIndex: "login_time", key: "login_time" },
  { title: "Logout Time", dataIndex: "logout_time", key: "logout_time" },
  { title: "Work Duration", dataIndex: "work", key: "work" },
  { title: "Team Meet", dataIndex: "team_meet", key: "team_meet" },
  { title: "Mng Meet", dataIndex: "mng_meet", key: "mng_meet" },

  { title: "Break Time", dataIndex: "break_time", key: "break_time" },
  { title: "Rendering", dataIndex: "rendering", key: "rendering" },

  { title: "No Work", dataIndex: "no_work", key: "no_work" },
  { title: "IT Issue", dataIndex: "it_issue", key: "it_issue" },
  { title: "Prod Sup", dataIndex: "prod_sup", key: "prod_sup" },
  { title: "Idle Time", dataIndex: "idle", key: "idle" },
  { title: "Mode Changed", dataIndex: "mode_changed", key: "mode_changed" },
  { title: "Current Mode", dataIndex: "current_mode", key: "current_mode" },
  { title: "Status", dataIndex: "status", key: "status" },
];

export const TableComponent = ({ data }) => {
  return <Table columns={columns} dataSource={data} pagination={false} />;
};
