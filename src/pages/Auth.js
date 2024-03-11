import { useLocation } from "react-router-dom";

const Auth = ({}) => {
  const location = useLocation();

  const hashParams = new URLSearchParams(location.hash.substring(1));

  const accessToken = hashParams.get("access_token");
  const expiresIn = hashParams.get("expires_in");

  if (accessToken) {
    sessionStorage.setItem(
      "token",
      JSON.stringify({
        accessToken,
        expiresIn: new Date().getTime() + expiresIn * 1000,
      })
    );
    window.location.href = "/?redirect_from=auth";
  } else {
    window.alert("인증에 실패했습니다.");
    window.location.href = "/";
  }
};

export default Auth;
