
let ws = null;
let connectPromise = null;

let dataToken = null;
let radioButtonValue = null;
let openedFilePath = null;

export function getWebSocket() {
  return ws;
}

export function getDataToken() {
  return dataToken;
}

export function getRadioButtonValue() {
  return radioButtonValue;
}

export function getOpenedFilePath() {
  return openedFilePath;
}

export function connectWebSocket() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    console.log("⚠️ WebSocket already connected or connecting.");
    return connectPromise;
  }

  connectPromise = new Promise((resolve, reject) => {
    ws = new WebSocket("ws://localhost:8118");

    ws.onopen = () => {
      console.log("✅ Connected to WebSocket server.");
      resolve(ws);
    };

    ws.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        if (parsedData.access) {
       
           dataToken = parsedData;
   
        }

        if ("radio_button" in parsedData) {
            console.log("radioButtonData", parsedData)
          radioButtonValue = parsedData.radio_button.trim().toLowerCase();
          window.dispatchEvent(new CustomEvent("statusChange", { detail: radioButtonValue }));
          window.desktopStatus = radioButtonValue;
        }

        if (parsedData.status === "logout") {
          window.dispatchEvent(new CustomEvent("wsForceLogout"));
        }
      } catch (err) {
        console.error("❌ Failed to parse WebSocket message:", err);
      }
    };

    ws.onclose = () => {
      console.log("❌ WebSocket disconnected. Reconnecting in 3s...");
      setTimeout(() => connectWebSocket(), 3000);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      
      reject(err);
    };
  });

  return connectPromise;
}
// connectWebSocket()
export function requestTokens() {
  return new Promise((resolve, reject) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const handleMessage = (event) => {
        const parsed = JSON.parse(event.data);
        if (parsed && parsed.access && parsed.refresh) {
          ws.removeEventListener("message", handleMessage);
          dataToken = parsed
          console.log("requestTokensData",parsed)
          resolve(parsed);
        }
      };
      ws.addEventListener("message", handleMessage);
      ws.send("get_tokens");
    } else {
      reject("⚠️ WebSocket not connected.");
    }
  });
}

export function sendFilePathToOpen(filePath) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(`open_file:${filePath}`);
    openedFilePath = filePath; 
  } else {
    console.log("⚠️ WebSocket not connected.");
  }
}

export function closeWebSocket() {
  if (ws) {
    ws.close();
    ws = null;
    connectPromise = null;
    console.log("🛑 WebSocket closed.");
  }
}
