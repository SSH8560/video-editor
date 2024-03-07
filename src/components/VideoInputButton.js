import { useRef } from "react";
import { Button } from "react-bootstrap";

const VideoInputButton = ({ onChange }) => {
  const inputRef = useRef();
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <Button
        style={{
          height: "100%",
        }}
        onClick={() => inputRef.current.click()}
      >
        비디오 업로드
      </Button>
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

export default VideoInputButton;
