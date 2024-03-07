import { memo } from "react";
import { Player, BigPlayButton, LoadingSpinner, ControlBar } from "video-react";
import "video-react/dist/video-react.css";

const VideoPlayer = memo(
  ({ url, playerRef, onChangePlayerState }) => {
    return (
      <Player
        src={url}
        width={"100%"}
        height={"100%"}
        fluid={false}
        ref={(player) => {
          if (player && playerRef.current !== player) {
            playerRef.current = player;
            playerRef.current.subscribeToStateChange(onChangePlayerState);
          }
        }}
      >
        <BigPlayButton position="center" />
        <LoadingSpinner />
        <ControlBar></ControlBar>
      </Player>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.url === nextProps.url;
  }
);
export default VideoPlayer;
