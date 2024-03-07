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
      if (response.error !== undefined) {
        throw response;
      }

      onTakeToken(response.access_token);
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
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return await response.blob();
  } catch (error) {
    console.error("Error fetching Blob data:", error);
  }
};
