import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";

// 9 scenes: 120+130+170+130+120+130+130+130+160 = 1220
// 8 transitions at 20 frames each = 160 overlap
// Total: 1220 - 160 = 1060 frames ≈ 35.3 seconds
export const RemotionRoot = () => (
  <Composition
    id="main"
    component={MainVideo}
    durationInFrames={1060}
    fps={30}
    width={1920}
    height={1080}
  />
);
