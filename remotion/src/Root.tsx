import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";

// 9 scenes: 120+130+130+130+120+130+130+130+160 = 1180
// 8 transitions at 20 frames each = 160 overlap
// Total: 1180 - 160 = 1020 frames = 34 seconds
export const RemotionRoot = () => (
  <Composition
    id="main"
    component={MainVideo}
    durationInFrames={1020}
    fps={30}
    width={1920}
    height={1080}
  />
);
