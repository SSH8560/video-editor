import { useContext, useRef } from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";

import styles from "./VideoEditorMenu.module.css";
import { ThemeContext } from "../App";

const VideoEditorMenu = ({ onClickGoogleDrive, onClickVideoInputButton }) => {
  const fileInputRef = useRef();

  const theme = useContext(ThemeContext);

  return (
    <div className={styles.video_editor_menu}>
      <DropdownButton
        variant={theme === "light" ? "primary" : "secondary"}
        title="비디오 가져오기"
      >
        <Dropdown.Item
          variant={theme === "light" ? "primary" : "secondary"}
          as="button"
          onClick={() => fileInputRef.current.click()}
        >
          <span>로컬</span>
          <input
            ref={fileInputRef}
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
    </div>
  );
};
export default VideoEditorMenu;
