import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Palette, X } from "lucide-react";
import { usePrefs } from "@/lib/prefs";
import type { SceneId } from "@/lib/types";

const PRESETS: { id: SceneId; label: string }[] = [
  { id: "bruma", label: "Bruma" },
  { id: "nocturno", label: "Nocturno" },
  { id: "brasa", label: "Brasa" },
  { id: "niebla", label: "Niebla" },
  { id: "marea", label: "Marea" },
];

function compressImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const max = 1400;
      const scale = Math.min(1, max / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error("canvas"));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL("image/jpeg", 0.72);
      URL.revokeObjectURL(url);
      if (data.length > 750_000) {
        reject(new Error("grande"));
        return;
      }
      resolve(data);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("imagen"));
    };
    image.src = url;
  });
}

export function CustomizeButton() {
  const scene = usePrefs((state) => state.scene);
  const imageUrl = usePrefs((state) => state.imageUrl);
  const setScene = usePrefs((state) => state.setScene);
  const setImageUrl = usePrefs((state) => state.setImageUrl);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog.Root>
      <Dialog.Trigger className="ghost-btn glass" type="button">
        <Palette />
        <span className="full-label">Personalizar fondo</span>
        <span className="short-label">Fondo</span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content glass" aria-describedby="fondo-ayuda">
          <div className="dialog-head">
            <div>
              <Dialog.Title asChild>
                <h2>Personalizar fondo</h2>
              </Dialog.Title>
              <Dialog.Description id="fondo-ayuda" className="note">
                El cristal de los paneles se adapta al fondo. Se guarda solo en este navegador.
              </Dialog.Description>
            </div>
            <Dialog.Close className="icon-btn" aria-label="Cerrar">
              <X />
            </Dialog.Close>
          </div>
          <div className="swatch-grid">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={scene === preset.id ? `swatch scene-${preset.id} is-selected` : `swatch scene-${preset.id}`}
                onClick={() => {
                  setError(null);
                  setScene(preset.id);
                }}
              >
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
          <label className="solid-btn file-btn">
            Subir imagen
            <input
              className="sr-file"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                void compressImage(file)
                  .then((data) => {
                    setImageUrl(data);
                    setScene("image");
                    setError(null);
                  })
                  .catch(() => setError("No se pudo usar esa imagen. Prueba con una más pequeña."));
              }}
            />
          </label>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              let parsed: URL;
              try {
                parsed = new URL(url.trim());
              } catch {
                setError("Pega una URL válida.");
                return;
              }
              if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
                setError("La URL tiene que empezar por http o https.");
                return;
              }
              setImageUrl(parsed.href);
              setScene("image");
              setError(null);
            }}
          >
            <label className="field-label" htmlFor="bg-url">
              O pega la URL de una imagen
            </label>
            <div className="url-row">
              <input
                id="bg-url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://"
                inputMode="url"
              />
              <button type="submit" className="solid-btn">
                Usar
              </button>
            </div>
          </form>
          {error ? <p className="form-error">{error}</p> : null}
          {scene === "image" && imageUrl ? (
            <button
              type="button"
              className="text-btn"
              onClick={() => {
                setImageUrl(null);
                setScene("bruma");
              }}
            >
              Quitar imagen
            </button>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
