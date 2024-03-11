import { memo } from "react";
import { Player, BigPlayButton, LoadingSpinner, ControlBar } from "video-react";
import "video-react/dist/video-react.css";

const VideoPlayer = memo(
  ({ maxHeight, url, playerRef, onChangePlayerState }) => {
    return (
      <div
        className="VideoPlayer"
        style={{
          maxHeight,
        }}
      >
        <Player
          src={url}
          width={"100%"}
          fluid={true}
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
      </div>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.url === nextProps.url;
  }
);
export default VideoPlayer;
