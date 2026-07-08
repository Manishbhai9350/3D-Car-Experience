import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import CarProvider from "./context/car/car.provider.tsx";
import { AudioContextProvider } from "./context/audio/audio.context.tsx";

createRoot(document.getElementById("root")!).render(
  <CarProvider>
    <AudioContextProvider>
      <App />
    </AudioContextProvider>
  </CarProvider>,
);
