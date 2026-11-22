import { usePrefs } from "@/lib/prefs";
import type { SceneId } from "@/lib/types";

const SCENES = new Set<SceneId>(["bruma", "nocturno", "brasa", "niebla", "marea", "image"]);

export function Backdrop() {
  const scene = usePrefs((state) => state.scene);
  const imageUrl = usePrefs((state) => state.imageUrl);
  const safe = SCENES.has(scene) ? scene : "bruma";
  const image = safe === "image" && imageUrl ? imageUrl : null;
  const mode = image ? "image" : safe === "image" ? "bruma" : safe;

  return (
    <div
      className={mode === "image" ? "scene scene-image" : `scene scene-${mode}`}
      style={image ? { backgroundImage: `url(${JSON.stringify(image)})` } : undefined}
    />
  );
}
