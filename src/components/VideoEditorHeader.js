import { Dropdown, DropdownButton } from "react-bootstrap";

import styles from "./VideoEditorHeader.module.css";
import { useRef } from "react";
const VideoEditorHeader = ({ onClickGoogleDrive, onClickVideoInputButton }) => {
  const inputRef = useRef();

  return (
    <header className={styles.header}>
      <div>
        <a href="/">
          <h1>Video Editor</h1>
        </a>
      </div>
      <DropdownButton title="비디오 가져오기">
        <Dropdown.Item as="button" onClick={() => inputRef.current.click()}>
          <span>로컬</span>
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            style={{ display: "none" }}
            onChange={onClickVideoInputButton}
          />
        </Dropdown.Item>
        <Dropdown.Item as="button" onClick={onClickGoogleDrive}>
          구글 드라이브
        </Dropdown.Item>
      </DropdownButton>
    </header>
  );
};
export default VideoEditorHeader;
