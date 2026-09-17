import "expo-router/entry";
import TrackPlayer from "react-native-track-player";
import { playbackService } from "./src/services/playback-service";

// Headless JS para controles de lockscreen/BT. Debe registrarse top-level,
// fuera de componentes (ver src/services/playback-service.ts).
TrackPlayer.registerPlaybackService(() => playbackService);
