import React, { useMemo } from "react";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  options?: any;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster, options }) => {
  // Memoize the source object to prevent unnecessary re-renders.
  const source = useMemo(() => ({
    type: "video",
    sources: [
      {
        src,
        provider: "html5",
      },
    ],
    poster: poster || "",
  }), [src, poster]);

  const defaultOptions = {
    controls: ["play", "progress", "current-time", "mute", "volume", "fullscreen"],
    // Add or remove controls as required.
  };

  return (
    <Plyr source={source} options={options || defaultOptions} />
  );
};

export default React.memo(VideoPlayer);
