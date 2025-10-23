export const addOneMinuteToTime = (timeStr) => {
    const [hh, mm, ss] = timeStr.split(":").map(Number);
    let totalSeconds = hh * 3600 + mm * 60 + ss + 60;
  
    const newH = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    totalSeconds %= 3600;
    const newM = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const newS = String(totalSeconds % 60).padStart(2, "0");
  
    return `${newH}:${newM}:${newS}`;
  };
  