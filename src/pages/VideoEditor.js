import { useEffect, useRef, useState } from "react";
import { Button, Slider } from "antd";
import {
  Accordion,
  DropdownButton,
  DropdownItem,
  Modal,
  ModalBody,
  ProgressBar,
  Spinner,
  Toast,
} from "react-bootstrap";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

import styles from "./VideoEditor.module.css";
import { fetchBlob, redirectToGoogleOauthEndpoint } from "../libs/actions";
import { TimeToSeconds, secondsToTime } from "../libs/utils";
import { MIME } from "../libs/constants";
import VideoPlayer from "../components/VideoPlayer";
import VideoInputImage from "../components/VideoInputImage";
import VideoEditorMenu from "../components/VideoEditorMenu";
import EditResolution from "../components/EditResolution";
import GoogleDriveFilesList from "../components/GoogleDriveFilesList";
import { useSearchParams } from "react-router-dom";

const VideoEditor = () => {
  const videoEditorRef = useRef();
  const videoContentRef = useRef();
  const playerRef = useRef();
  const ffmpegRef = useRef(new FFmpeg());
  const messageRef = useRef();
  const isMultiThread = useRef(false);
  const isEditorReadyRef = useRef();
  const tokenRef = useRef();

  const [searchParams, setSearchParams] = useSearchParams();

  const [isLoaded, setIsLoaded] = useState(false);
  const [isSelectingGoogleDriveFiles, setIsSelectingGoogleDriveFiles] =
    useState(false);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [isTranscoding, setIsTranscoding] = useState(false);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [isShowingCompleteToast, setIsShowingCompleteToast] = useState(false);

  const [screenWidth, setScreenWidth] = useState();
  const [currentProgressSeconds, setCurrentProgressSeconds] = useState(0);
  const [url, setUrl] = useState();
  const [playerState, setPlayerState] = useState();
  const [sliderValues, setSliderValues] = useState([0, 0]);
  const [resolution, setResolution] = useState();

  useEffect(() => {
    setScreenWidth(window.innerWidth);
    window.addEventListener("resize", () => {
      handleOnChangeScreenWidth(window.innerWidth);
    });

    const token = JSON.parse(sessionStorage.getItem("token"));
    if (token && parseInt(token.expiresIn) > new Date().getTime()) {
      tokenRef.current = token;
    }

    if (searchParams.get("redirect_from") === "auth") {
      setIsSelectingGoogleDriveFiles(true);
      setSearchParams();
    }

    load();
  }, []);

  useEffect(() => {
    if (playerState) {
      if (sliderValues[0] !== 0 && playerState.currentTime >= sliderValues[1]) {
        playerRef.current.seek(sliderValues[0]);
        playerRef.current.play();
      }
    }
  }, [playerState]);

  useEffect(() => {
    if (isEditorReady) {
      const $videoReact = document.querySelector(".video-react-fluid");
      const wrapperWidth = videoContentRef.current.clientWidth;
      $videoReact.style = `${$videoReact.style.cssText} max-width:${wrapperWidth}px; width:${wrapperWidth}px;`;
    }
  }, [screenWidth]);

  const load = async () => {
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", ({ message }) => {
      messageRef.current.innerHTML = message;
      const regex = /\b\d{2}:\d{2}:\d{2}\.\d{2}\b/;
      const match = message.match(regex);
      if (match) {
        setCurrentProgressSeconds(parseInt(TimeToSeconds(match[0])));
      }
    });

    if (typeof SharedArrayBuffer === "undefined") {
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
      });
      isMultiThread.current = false;
      console.log("Single thread Ready");
    } else {
      const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
        workerURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.worker.js`,
          "text/javascript"
        ),
      });
      console.log("Multi thread Ready");
      isMultiThread.current = true;
    }

    setIsLoaded(true);
  };

  const initiateEditor = (playerState) => {
    const { duration, videoWidth, videoHeight } = playerState;
    handleOnChangeIsEditorReady(true);
    setSliderValues([0, duration]);
    setResolution([videoWidth, videoHeight]);
    setReactVideoWidthAndMaxWidth();
    setVideoPlayerWidthAndMaxWidth();

    function setVideoPlayerWidthAndMaxWidth() {
      const aspect = parseFloat(videoWidth / videoHeight);
      const $videoPlayer = document.querySelector(".VideoPlayer");

      const videoPlayerMaxHeight = parseInt(
        window.getComputedStyle($videoPlayer).getPropertyValue("max-height")
      );

      const maxWidth = videoPlayerMaxHeight * aspect;
      $videoPlayer.style = `${$videoPlayer.style.cssText} max-width:${maxWidth}px;`;
    }
  };

  const handleOnChangeIsEditorReady = (isReady) => {
    setIsEditorReady(isReady);
    isEditorReadyRef.current = isReady;
  };

  const handleOnChangeScreenWidth = (screenWidth) => {
    const $videoReact = document.querySelector(".video-react-fluid");
    if ($videoReact) {
      const wrapperWidth = videoContentRef.current.clientWidth;
      $videoReact.style = `${$videoReact.style.cssText} max-width:${wrapperWidth}px; width:${wrapperWidth}px;`;
      setScreenWidth(screenWidth);
    }
  };

  const handleOnChangeUrl = (newUrl) => {
    handleOnChangeIsEditorReady(false);
    URL.revokeObjectURL(url);
    setUrl(newUrl);
  };

  const handleOnChangePlayerState = (state, prevState) => {
    if (isNaN(state.duration)) {
      return;
    }

    setPlayerState(state);
    if (!isEditorReadyRef.current) {
      initiateEditor(state);
    }
  };

  const handleOnChangeSliderValues = (values) => {
    if (values[0] === values[1]) {
      return;
    }

    const newValues = [...values];

    if (newValues[1] > playerState.duration) {
      newValues[1] = playerState.duration;
    }

    playerRef.current.seek(newValues[0]);
    setSliderValues(newValues);
  };

  const handleOnClickGoogleDriveFile = async (id) => {
    setIsSelectingGoogleDriveFiles(false);
    setIsLoadingVideo(true);
    const blob = await fetchBlob(tokenRef.current.accessToken, id);
    setIsLoadingVideo(false);
    setUrl(URL.createObjectURL(blob));
  };

  const handleOnChangeIsShowingCompleteToast = (isShowing) => {
    if (isShowing) {
      setTimeout(() => {
        setIsShowingCompleteToast(false);
      }, 5000);
    }
    setIsShowingCompleteToast(isShowing);
  };

  return (
    <>
      {isLoaded ? (
        <div ref={videoEditorRef} className={styles.video_editor}>
          <VideoEditorMenu
            onClickGoogleDrive={() => {
              if (tokenRef.current) {
                setIsSelectingGoogleDriveFiles(true);
              } else {
                redirectToGoogleOauthEndpoint();
              }
            }}
            onClickVideoInputButton={(event) => {
              handleOnChangeUrl(URL.createObjectURL(event.target.files[0]));
            }}
          />
          <div ref={videoContentRef} className={styles.video_content}>
            {url ? (
              <VideoPlayer
                maxHeight={700}
                playerRef={playerRef}
                url={url}
                onChangePlayerState={handleOnChangePlayerState}
              />
            ) : (
              <VideoInputImage
                onChange={(event) => {
                  handleOnChangeUrl(URL.createObjectURL(event.target.files[0]));
                }}
              />
            )}
          </div>
          {!isEditorReady || (
            <div className={styles.edit_controller}>
              <div className={styles.slider}>
                <span htmlFor="slider">
                  타임라인 :{" "}
                  <span className={styles.time_line_value}>{`${secondsToTime(
                    sliderValues[0]
                  )}`}</span>
                  부터{" "}
                  <span className={styles.time_line_value}>{`${secondsToTime(
                    sliderValues[1]
                  )}`}</span>
                  까지
                </span>
                <Slider
                  id="slider"
                  value={sliderValues}
                  onChange={handleOnChangeSliderValues}
                  tooltip={{
                    formatter: (value) => secondsToTime(value),
                  }}
                  range={{ draggableTrack: true }}
                  min={0}
                  max={playerState?.duration ?? 0}
                />
              </div>

              <Accordion>
                <Accordion.Header>옵션</Accordion.Header>
                <Accordion.Body>
                  <Accordion>
                    <Accordion.Header>해상도</Accordion.Header>
                    <Accordion.Body>
                      <EditResolution
                        resolution={resolution}
                        setResolution={setResolution}
                      />
                    </Accordion.Body>
                  </Accordion>
                </Accordion.Body>
              </Accordion>
              <div className={styles.buttons}>
                <DropdownButton title="저장하기" variant="secondary">
                  <DropdownItem as="button" onClick={convertToGif}>
                    GIF
                  </DropdownItem>
                  <DropdownItem as="button" onClick={convertToMp4}>
                    MP4
                  </DropdownItem>
                  <DropdownItem as="button" onClick={convertToMp3}>
                    MP3
                  </DropdownItem>
                </DropdownButton>
              </div>
            </div>
          )}
        </div>
      ) : null}
      <Modal show={isSelectingGoogleDriveFiles}>
        <GoogleDriveFilesList
          onClickFile={handleOnClickGoogleDriveFile}
          onClickCancelButton={() => setIsSelectingGoogleDriveFiles(false)}
        />
      </Modal>
      <Modal show={isLoadingVideo}>
        <Modal.Header>
          <h2 className={styles.progress_header}>불러오는 중...</h2>
        </Modal.Header>
        <ModalBody>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </ModalBody>
      </Modal>
      <Modal show={isTranscoding}>
        <Modal.Header>
          <h2 className={styles.progress_header}>진행 중</h2>
        </Modal.Header>
        <Modal.Body>
          <ProgressBar
            now={
              !isNaN(playerState?.duration)
                ? parseInt(
                    (currentProgressSeconds / playerState.duration) * 100
                  )
                : 0
            }
            animated
          />
          <p ref={messageRef} className={styles.progress_desc}></p>
        </Modal.Body>
      </Modal>
      <div className={styles.toast_wrapper}>
        <Toast show={isShowingCompleteToast}>
          <Toast.Body>
            <div className={styles.toast_content}>
              <span>저장하기 완료!</span>
              <button
                className={styles.toast_close_button}
                onClick={() => setIsShowingCompleteToast(false)}
              >
                X
              </button>
            </div>
          </Toast.Body>
        </Toast>
      </div>
    </>
  );

  async function convertToGif() {
    transcode("gif", { sliderValues, resolution, useEncode: true });
  }

  async function convertToMp4() {
    transcode("mp4", {
      sliderValues,
      resolution,
    });
  }

  async function convertToMp3() {
    transcode("aac", { sliderValues, onlyAudio: true });
  }

  async function transcode(extension, options) {
    const ffmpeg = ffmpegRef.current;
    const inputFileName = "input.mp4";
    const outputFileName = `result.${extension}`;

    try {
      setIsTranscoding(true);
      setCurrentProgressSeconds(0);

      await ffmpeg.writeFile(inputFileName, await fetchFile(url));

      const command = [
        "-i",
        inputFileName,
        ...createOptionCommandList({
          ...options,
          useMultiThread: isMultiThread.current,
        }),
        outputFileName,
      ];

      console.log(`exec : ffmpeg ${command.join(" ")}`);
      await ffmpeg.exec(command);

      const data = await ffmpeg.readFile(outputFileName);

      const gifUrl = URL.createObjectURL(
        new Blob([data.buffer], { type: MIME[extension] })
      );
      const link = document.createElement("a");
      link.href = gifUrl;
      link.setAttribute("download", "");
      link.click();

      handleOnChangeIsShowingCompleteToast(true);
    } catch (e) {
      alert(e);
    } finally {
      setIsTranscoding(false);
    }

    function createOptionCommandList({
      sliderValues,
      resolution,
      onlyAudio = false,
      useEncode = false,
      useMultiThread = false,
    }) {
      const commandList = [];
      if (useMultiThread) {
        const threadNumber = parseInt(navigator.hardwareConcurrency / 2);
        commandList.push("-threads");
        commandList.push(`${threadNumber}`);
      }

      if (sliderValues) {
        const [startTime, endTime] = sliderValues;
        commandList.push("-ss");
        commandList.push(`${startTime}`);
        commandList.push("-to");
        commandList.push(`${endTime}`);
      }

      if (onlyAudio) {
        commandList.push("-vn");
        commandList.push("-acodec");
        commandList.push("copy");
        return commandList;
      }

      if (
        resolution &&
        resolution[0] !== playerState.videoWidth &&
        resolution[1] !== playerState.videoHeight
      ) {
        commandList.push("-vf");
        commandList.push(`scale=${resolution[0]}:${resolution[1]}`);
      }

      if (!useEncode && !commandList.includes("-vf")) {
        commandList.push("-c");
        commandList.push("copy");
      }

      return commandList;
    }
  }

  function setReactVideoWidthAndMaxWidth() {
    const $videoReact = document.querySelector(".video-react-fluid");
    const wrapperWidth = videoContentRef.current.clientWidth;
    $videoReact.style = `${$videoReact.style.cssText} max-width:${wrapperWidth}px; width:${wrapperWidth}px;`;
  }
};

export default VideoEditor;
