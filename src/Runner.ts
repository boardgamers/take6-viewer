import { useType, useCallbackAsCurrent } from "@hex-engine/2d";

export default function Runner() {
  useType(Runner);

  return {
    run: useCallbackAsCurrent(f => f())
  };
}