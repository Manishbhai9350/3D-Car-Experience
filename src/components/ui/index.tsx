import React from "react";
import { useCar } from "../../context/car/car.hook";
import RadialWheel from "./wheel";

const UI = () => {
  const { colors, currentColorIndex, isAnimatingRef, setCurrentColorIndex } =
    useCar();

  function HandleClick(index: number) {
    if (isAnimatingRef?.current) return;

    setCurrentColorIndex(index);
  }

  return (
    <div className="ui">
      <div className="wheel">
        <div className="radial">
          <RadialWheel />
        </div>
        <div className="wheel-line"></div>
      </div>
      <div className="colors">
        <div className="progress">
          <div className="line color-progress-line"></div>
        </div>
        {colors.map((C, i) => {
          return (
            <div
              key={i}
              onClick={() => HandleClick(i)}
              className={`color-box ${currentColorIndex == i ? "selected" : ""}`}
              style={{ background: "#" + C.body.getHexString() }}
            ></div>
          );
        })}
      </div>
    </div>
  );
};

export default UI;
