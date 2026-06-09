import { useContext } from "react";
import { CarContext } from "./car.context";

export const useCar = () => {
  const ctx = useContext(CarContext);
  if (ctx) {
    return ctx;
  } else {
    throw new Error("useCar Hook can only be called inside CarProvider!");
  }
};
