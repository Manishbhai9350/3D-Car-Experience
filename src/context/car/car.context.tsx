import { createContext, type Dispatch, type RefObject, type SetStateAction } from "react";
import { COLORS } from "../../data.";

interface CarContextProps {
  colors: typeof COLORS;
  currentColorIndex: number;
  setCurrentColorIndex: Dispatch<SetStateAction<number>>;
  isAnimatingRef: RefObject<boolean> | null;
}

export const CarContext = createContext<CarContextProps>({
  colors: COLORS,
  currentColorIndex: 0,
  setCurrentColorIndex: () => {},
  isAnimatingRef: null
});
