import { useContext, useEffect, useState } from "react";
import sumImage from "../assets/sun.svg";
import moonImage from "../assets/moon.svg";
import styles from "./AppHeader.module.css";
import { ThemeContext } from "../App";

const AppHeader = () => {
  const [theme, handleOnChangeTheme] = useContext(ThemeContext);

  return (
    <header className={styles.app_header}>
      <div className={styles.app_header_container}>
        <a href="/">
          <h1 className={styles.app_title}>Video Editor</h1>
        </a>
        <button
          className={styles.dark_mode_button}
          onClick={() =>
            handleOnChangeTheme(theme === "light" ? "dark" : "light")
          }
        >
          <img
            className={styles.dark_mode_button__img}
            src={theme === "light" ? sumImage : moonImage}
            alt="darkModeImage"
          />
        </button>
      </div>
    </header>
  );
};
export default AppHeader;
