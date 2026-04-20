import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";

// 9 scenes: 120+130+270+130+120+130+130+130+160 = 1320
// 8 transitions at 20 frames each = 160 overlap
// Total: 1320 - 160 = 1160 frames ≈ 38.7s
export const RemotionRoot = () => (
  <Composition
    id="main"
    component={MainVideo}
    durationInFrames={1160}
    fps={30}
    width={1920}
    height={1080}
  />
);
