import { AbsoluteFill } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { Scene1HeroIntro } from "./scenes/Scene1";
import { Scene2NodeLibrary } from "./scenes/Scene2";
import { Scene3WorkflowCanvas } from "./scenes/Scene3";
import { Scene4AIAssistant } from "./scenes/Scene4";
import { Scene5CodeEditor } from "./scenes/Scene5";
import { Scene6Integrations } from "./scenes/Scene6";
import { Scene7RealTimeExecution } from "./scenes/Scene7";
import { Scene8VersionControlDeploy } from "./scenes/Scene8";
import { Scene9Closing } from "./scenes/Scene9";
import { PersistentBackground } from "./components/PersistentBackground";

const transition = (type: "fade" | "slide-left" | "slide-right" = "fade") => {
  const presentation =
    type === "slide-left"
      ? slide({ direction: "from-left" })
      : type === "slide-right"
        ? slide({ direction: "from-right" })
        : fade();
  return { presentation, timing: springTiming({ config: { damping: 200 }, durationInFrames: 20 }) };
};

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <PersistentBackground />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={120}>
          <Scene1HeroIntro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition {...transition("fade")} />

        <TransitionSeries.Sequence durationInFrames={130}>
          <Scene2NodeLibrary />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition {...transition("slide-left")} />

        <TransitionSeries.Sequence durationInFrames={130}>
          <Scene3WorkflowCanvas />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition {...transition("fade")} />

        <TransitionSeries.Sequence durationInFrames={130}>
          <Scene4AIAssistant />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition {...transition("slide-right")} />

        <TransitionSeries.Sequence durationInFrames={120}>
          <Scene5CodeEditor />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition {...transition("fade")} />

        <TransitionSeries.Sequence durationInFrames={130}>
          <Scene6Integrations />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition {...transition("slide-left")} />

        <TransitionSeries.Sequence durationInFrames={130}>
          <Scene7RealTimeExecution />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition {...transition("fade")} />

        <TransitionSeries.Sequence durationInFrames={130}>
          <Scene8VersionControlDeploy />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition {...transition("slide-right")} />

        <TransitionSeries.Sequence durationInFrames={160}>
          <Scene9Closing />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
