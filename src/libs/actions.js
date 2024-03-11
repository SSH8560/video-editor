import { clientId, scope } from "./constants";

export const showVideoPicker = (accessToken, onPicked) => {
  const { gapi, google } = window;

  gapi.load("picker", () => {
    const view = new google.picker.View(google.picker.ViewId.DOCS);
    view.setMimeTypes("video/mp4");

    const picker = new google.picker.PickerBuilder()
      .enableFeature(google.picker.Feature.NAV_HIDDEN)
      .setOrigin("http://localhost:3000")
      .setOAuthToken(accessToken)
      .addView(view)
      .setCallback(onPicked)
      .build();

    picker.setVisible(true);
  });
};

export const getAccessToken = (accessToken, onTakeToken) => {
  const tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: scope,
    callback: async (response) => {
      console.log(response);
      if (response.error) {
        throw response;
      }
      if (response.access_token) {
        onTakeToken(response.access_token);
      }
    },
  });

  if (accessToken) {
    tokenClient.requestAccessToken({ prompt: "" });
  } else {
    tokenClient.requestAccessToken({ prompt: "consent" });
  }
};

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
  searchParams.set("redirect_uri", "http://localhost:3000/auth");
  searchParams.set("response_type", "token");
  searchParams.set("scope", scope);

  window.location.href = `${url}?${searchParams.toString()}`;
};
