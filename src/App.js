import { createContext, useEffect, useReducer, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import styles from "./App.module.css";
import AppFooter from "./components/AppFooter";
import AppHeader from "./components/AppHeader";
import VideoEditor from "./pages/VideoEditor";
import Auth from "./pages/Auth";

export const ThemeContext = createContext("light");
export const OauthTokenContext = createContext();

const App = () => {
  const [theme, setTheme] = useState("light");

  const handleOnChangeTheme = (theme) => {
    const $html = document.querySelector("html");
    if (theme === "light") {
      $html.classList.remove("dark");
      $html.removeAttribute("data-bs-theme");
    } else {
      $html.classList.add("dark");
      $html.setAttribute("data-bs-theme", "dark");
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
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<VideoEditor />} />
              <Route path="/auth" element={<Auth />} />
            </Routes>
          </BrowserRouter>
        </main>
        <AppFooter />
      </ThemeContext.Provider>
    </div>
  );
};

export default App;
