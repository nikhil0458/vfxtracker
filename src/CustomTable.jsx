import { useState, useMemo, useRef} from "react";

function CustomTable({ data , darkTheme}) {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [filters, setFilters] = useState({});

  const headers = Object.keys(data[0]);
   console.log("headers", headers)
  
  const [colWidths, setColWidths] = useState(
    headers.reduce((acc, key) => ({ ...acc, [key]: 150 }), {})
  );

  const tableRef = useRef(null);

  const filteredData = useMemo(() => {
    return data.filter((row) =>
      headers.every((key) =>
        filters[key]
          ? String(row[key]).toLowerCase().includes(filters[key].toLowerCase())
          : true
      )
    );
  }, [filters, data]);
  console.log("filteredDataCustomTable", filteredData)
  
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];
      console.log("valA",valA, "valB",valB)
      if (typeof valA === "number" && typeof valB === "number") {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
    console.log("sorted", sorted)
    return sorted;
  }, [filteredData, sortColumn, sortAsc]);

  const toggleSort = (key) => {
    if (key === sortColumn) {
      setSortAsc(!sortAsc);
    } else {
      setSortColumn(key);
      setSortAsc(true);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const startResize = (e, key) => {
    e.preventDefault();
    const startX = e.clientX;
    console.log("startx", startX)
    const startWidth = colWidths[key];

    const onMouseMove = (e) => {
      const delta = e.clientX - startX;
      const newWidth = Math.max(startWidth + delta, 50); 
      setColWidths((prev) => ({ ...prev, [key]: newWidth }));
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  
  return (
    <div style={{ overflowX: "auto" }}>
      <table    ref={tableRef} border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            {headers.map((key) => (
              <th key={key} onClick={() => toggleSort(key)} style={{ cursor: "pointer", position:"relative", width: colWidths[key],
                minWidth: 50, }}>
                {key.toUpperCase()} {sortColumn === key ? (sortAsc ? "🔼" : "🔽") : ""}
                <div
                  onMouseDown={(e) => startResize(e, key)}
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    height: "100%",
                    width: "6px",
                    cursor: "col-resize",
                    backgroundColor: "#ccc",
                    zIndex: 1,
                    transition: "background-color 0.2s"

                    // userSelect: "none",
                    // backgroundColor: "red", 
                    // zIndex: 10,
                  }}
                />
              </th>
            ))}
          </tr>
          <tr>
            {headers.map((key) => (
              <th key={key}>
                <input
                  type="text"
                  placeholder={`Filter ${key}`}
                  value={filters[key] || ""}
                  onChange={(e) => handleFilterChange(key, e.target.value)}
                  style={{ 
                    width: "100%",
                    padding: "4px",
                  //  backgroundColor: "#222",   
                  // color: "#fff",     
                  backgroundColor: darkTheme ? "#1f1f1f" : "#fff",
                  color: darkTheme ? "#fff" : "#000",         
                   border: "1px solid #555",  
                    borderRadius: "4px",
                   
                  

                   }}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, idx) => (
            <tr key={idx}>
              {headers.map((key) => (
                <td key={key}
                style={{ width: colWidths[key], minWidth: 50 }}
                >{row[key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CustomTable;
