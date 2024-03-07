import { useRef } from "react";
import videoInputPlaceholder from "../assets/images/video_placeholder.png";

const VideoInputImage = ({ onChange }) => {
  const inputRef = useRef();

  return (
    <div
      style={{
        maxHeight: "inherit",
      }}
    >
      <img
        style={{
          width: "100%",
          maxHeight: "inherit",
        }}
        src={videoInputPlaceholder}
        alt="placeholder"
        onClick={() => inputRef.current.click()}
      />
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        style={{ display: "none" }}
        onChange={onChange}
      />
    </div>
  );
};
export default VideoInputImage;
