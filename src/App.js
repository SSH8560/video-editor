import { createContext, useEffect, useReducer, useState } from "react";

import styles from "./App.module.css";
import AppFooter from "./components/AppFooter";
import AppHeader from "./components/AppHeader";
import VideoEditor from "./pages/VideoEditor";

export const ThemeContext = createContext("light");

const App = () => {
  const [theme, setTheme] = useState("light");

  const handleOnChangeTheme = (theme) => {
    const $html = document.querySelector("html");
    if (theme === "light") {
      $html.classList.remove("dark");
    } else {
      $html.classList.add("dark");
    }
    localStorage.setItem("theme", theme);
    setTheme(theme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    savedTheme === "null"
      ? handleOnChangeTheme("light")
      : handleOnChangeTheme(savedTheme);
  }, []);

  return (
    <div className="App">
      <ThemeContext.Provider value={[theme, handleOnChangeTheme]}>
        <AppHeader />
        <main className={styles.app_main}>
          <VideoEditor />
        </main>
        <AppFooter />
      </ThemeContext.Provider>
    </div>
  );
};

export default App;
