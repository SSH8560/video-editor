import { clientId, proejctUrl, scope } from "./constants";

export const fetchBlob = async (accessToken, fileId) => {
  try {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return await response.blob();
  } catch (error) {
    console.error("Error fetching Blob data:", error);
  }
};

export const fetchVideoFilesList = async (accessToken) => {
  try {
    const params = new URLSearchParams();
    params.set("q", "mimeType='video/mp4'");
    params.set("access_token", accessToken);
    params.set("fields", "files(id,name,thumbnailLink)");

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files${
        params.toString() ? `?${params.toString()}` : ""
      }`
    );
    const data = await response.json();
    return data.files;
  } catch (error) {
    console.error("Error fetching videos:", error);
  }
};

export const redirectToGoogleOauthEndpoint = () => {
  const url = "https://accounts.google.com/o/oauth2/v2/auth";
  const searchParams = new URLSearchParams();
  searchParams.set("client_id", clientId);
  searchParams.set("redirect_uri", `${proejctUrl}/auth`);
  searchParams.set("response_type", "token");
  searchParams.set("scope", scope);

  window.location.href = `${url}?${searchParams.toString()}`;
};
