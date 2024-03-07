export const readFileAsBase64 = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const secondsToTime = (secs) => {
  const hours = String(Math.floor(secs / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  const seconds = String(secs % 60).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};

export const TimeToSeconds = (times) => {
  const [time] = times.split(".");

  const [hours, minutes, seconds] = time.split(":").map((it) => parseInt(it));

  return hours * 3600 + minutes * 60 + seconds;
};
