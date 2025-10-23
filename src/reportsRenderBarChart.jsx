import {
  BarChart,
  XAxis,
  YAxis,
  Bar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import "./reportsRenderBarChart.css";

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

const renderBarChart = (data, title, hueOffset) => (
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
    <ResponsiveContainer width="100%" aspect={1} style={{ background: "none" }}>
      <BarChart
        data={processDataWithColors(data, hueOffset)}
        margin={{ bottom: 60 }}
      >
        <XAxis
          dataKey="name"
          stroke="blue"
          // stroke="#000"
          tick={{
            fontWeight: "bold",
            fontSize: 14,
            angle: -45,
            textAnchor: "end",
            fill: "grey",
          }}
          axisLine={{ stroke: "blue", strokeWidth: 2 }}
        />
        <YAxis
          // stroke="#000"
          stroke="blue"
          tick={{ fontWeight: "bold", fontSize: 16, fill: "grey" }}
          axisLine={{ stroke: "blue", strokeWidth: 2 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "transparent",
            borderColor: "blue",
            fontWeight: "bold",
            fontSize: "18px",
          }}
        />

        <Bar
          dataKey="value"
          fill={(entry) => entry.fill}
          barSize={30}
          // isAnimationActive={false}
          background={(_, index) => (index === 2 ? null : undefined)}
          // activeBar={{opacity: 0}}
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

export default renderBarChart;
