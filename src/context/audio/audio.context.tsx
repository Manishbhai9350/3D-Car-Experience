import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

interface AudioContextProps {
  played: boolean;
  setPlayed: Dispatch<SetStateAction<boolean>>;
  radial: boolean;
  setRadial: Dispatch<SetStateAction<boolean>>;
}

const AudioContext = createContext<AudioContextProps>({
  played: false,
  setPlayed: () => {},
  radial: false,
  setRadial: () => {},
});

export const AudioContextProvider = ({ children }: { children: ReactNode }) => {
  const [played, setPlayed] = useState(false);
  const [radial, setRadial] = useState(false);

  return (
    <AudioContext.Provider value={{ played, setPlayed, radial, setRadial }}>
      {children}
    </AudioContext.Provider>
  );
};

export const UseAudio = () => {
  const context = useContext(AudioContext);

  if (!context) {
    throw new Error("Please use UseAudio hook inside AudioContextProvider");
  } else {
    return context;
  }
};
