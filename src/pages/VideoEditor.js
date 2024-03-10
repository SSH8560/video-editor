import { useCallback, useEffect, useRef, useState } from "react";
import { Slider } from "antd";
import {
  Accordion,
  Button,
  DropdownButton,
  DropdownItem,
  Modal,
  ProgressBar,
  Spinner,
} from "react-bootstrap";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

import styles from "./VideoEditor.module.css";
import { fetchBlob, getAccessToken, showVideoPicker } from "../libs/actions";
import { TimeToSeconds, secondsToTime } from "../libs/utils";
import { MIME } from "../libs/constants";
import VideoPlayer from "../components/VideoPlayer";
import VideoInputImage from "../components/VideoInputImage";
import VideoEditorMenu from "../components/VideoEditorMenu";
import EditResolution from "../components/EditResolution";

const VideoEditor = () => {
  const videoEditorRef = useRef();
  const videoContentRef = useRef();
  const playerRef = useRef();
  const ffmpegRef = useRef(new FFmpeg());
  const messageRef = useRef();
  const accessTokenRef = useRef();
  const isMultiThread = useRef(false);
  const isEditorReadyRef = useRef();

  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [isTranscoding, setIsTranscoding] = useState(false);
  const [isEditorReady, setIsEditorReady] = useState(false);

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

    playerRef.current.seek(sliderValues[0]);
    setSliderValues(newValues);
  };

  const handleOnPicked = async (data) => {
    if (data.action === "picked") {
      const fileData = data.docs[0];

      setIsLoadingVideo(true);
      const blob = await fetchBlob(accessTokenRef.current, fileData.id);
      setIsLoadingVideo(false);
      setUrl(URL.createObjectURL(blob));
    }
  };

  return (
    <>
      {isLoaded ? (
        <div ref={videoEditorRef} className={styles.video_editor}>
          <VideoEditorMenu
            onClickGoogleDrive={() => {
              getAccessToken(accessTokenRef.current, (accessToken) => {
                accessTokenRef.current = accessToken;
                showVideoPicker(accessTokenRef.current, handleOnPicked);
              });
            }}
            onClickVideoInputButton={(event) => {
              handleOnChangeUrl(URL.createObjectURL(event.target.files[0]));
            }}
          />
          <div ref={videoContentRef} className={styles.video_content}>
            {url ? (
              <VideoPlayer
                maxHeight={800}
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
              <Slider
                value={sliderValues}
                onChange={handleOnChangeSliderValues}
                tooltip={{
                  formatter: (value) => secondsToTime(value),
                }}
                range={{ draggableTrack: true }}
                min={0}
                max={playerState?.duration ?? 0}
              />
              <Accordion
                style={{
                  margin: "8px 0px",
                }}
              >
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
              <div className={styles.actions_wrapper}>
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
      <Modal show={isLoadingVideo}>
        <Modal.Header>
          <h2 className={styles.progress_header}>불러오는 중...</h2>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Modal.Header>
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
    } catch (e) {
      alert(e);
    } finally {
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
