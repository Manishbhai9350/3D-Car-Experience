import { useRef, useState, type ReactNode } from "react";
import { CarContext } from "./car.context";
import { COLORS } from "../../data.";

const CarProvider = ({ children }: { children: ReactNode }) => {
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const isAnimatingRef = useRef(false);

  return (
    <CarContext.Provider
      value={{
        colors: COLORS,
        currentColorIndex,
        setCurrentColorIndex,
        isAnimatingRef
      }}
    >
      {children}
    </CarContext.Provider>
  );
};

export default CarProvider;
