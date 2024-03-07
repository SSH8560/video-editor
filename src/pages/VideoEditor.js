import { useEffect, useRef, useState } from "react";
import { Slider } from "antd";
import { TimeToSeconds, secondsToTime } from "../libs/utils";
import {
  Accordion,
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
import { MIME } from "../libs/constants";
import VideoPlayer from "../components/VideoPlayer";
import VideoInputImage from "../components/VideoInputImage";
import VideoEditorHeader from "../components/VideoEditorHeader";
import EditResolution from "../components/EditResolution";

const VideoEditor = () => {
  const playerRef = useRef();
  const ffmpegRef = useRef(new FFmpeg());
  const messageRef = useRef();
  const accessTokenRef = useRef();

  const [isLoaded, setIsLoaded] = useState();
  const [isLoadingVideo, setIsLoadingVideo] = useState();
  const [isTranscoding, setIsTranscoding] = useState();
  const [currentProgressSeconds, setCurrentProgressSeconds] = useState(0);
  const [url, setUrl] = useState();
  const [playerState, setPlayerState] = useState();
  const [sliderValues, setSliderValues] = useState([0, 0]);
  const [resolution, setResolution] = useState();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
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

  const load = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", ({ message }) => {
      messageRef.current.innerHTML = message;
      const regex = /\b\d{2}:\d{2}:\d{2}\.\d{2}\b/;
      const match = message.match(regex);
      if (match) {
        setCurrentProgressSeconds(parseInt(TimeToSeconds(match[0])));
      }
    });

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });
    setIsLoaded(true);
  };

  const initEditor = (playerState) => {
    const { duration, videoWidth, videoHeight } = playerState;
    setIsReady(true);
    setSliderValues([0, duration]);
    setResolution([videoWidth, videoHeight]);
  };

  const hnadleOnChangeUrl = (newUrl) => {
    setIsReady(false);
    URL.revokeObjectURL(url);
    setUrl(newUrl);
  };

  const handleOnChangePlayerState = (state, prevState) => {
    if (isNaN(state.duration)) {
      return;
    }

    setPlayerState(state);

    if (prevState.duration !== state.duration) {
      initEditor(state);
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
        <div className={styles.video_editor}>
          <VideoEditorHeader
            onClickGoogleDrive={() => {
              getAccessToken(accessTokenRef.current, (accessToken) => {
                accessTokenRef.current = accessToken;
                showVideoPicker(accessTokenRef.current, handleOnPicked);
              });
            }}
            onClickVideoInputButton={(event) => {
              hnadleOnChangeUrl(URL.createObjectURL(event.target.files[0]));
            }}
          />
          <div className={styles.video_player}>
            {url ? (
              <VideoPlayer
                playerRef={playerRef}
                url={url}
                onChangePlayerState={handleOnChangePlayerState}
              />
            ) : (
              <VideoInputImage
                onChange={(event) => {
                  hnadleOnChangeUrl(URL.createObjectURL(event.target.files[0]));
                }}
              />
            )}
          </div>
          <div className={styles.edit_controller}>
            {!isReady || (
              <>
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
                  <DropdownButton title="저장하기">
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
              </>
            )}
          </div>
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
    transcode(
      "gif",
      createOptionCommandList({ sliderValues, resolution, useEncode: true })
    );
  }

  async function convertToMp4() {
    transcode(
      "mp4",
      createOptionCommandList({
        sliderValues,
        resolution,
      })
    );
  }

  async function convertToMp3() {
    transcode(
      "aac",
      createOptionCommandList({ sliderValues, onlyAudio: false })
    );
  }

  async function transcode(extension, commandList) {
    const ffmpeg = ffmpegRef.current;
    const inputFileName = "input.mp4";
    const outputFileName = `result.${extension}`;

    try {
      setIsTranscoding(true);
      setCurrentProgressSeconds(0);

      await ffmpeg.writeFile(inputFileName, await fetchFile(url));

      const command = ["-i", inputFileName, ...commandList, outputFileName];
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
      setIsTranscoding(false);
    }
  }

  function createOptionCommandList({
    sliderValues,
    resolution,
    onlyAudio = false,
    useEncode = false,
  }) {
    const commandList = [];
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
};
export default VideoEditor;
