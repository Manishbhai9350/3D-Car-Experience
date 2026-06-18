import React from "react";
import { useCar } from "../../context/car/car.hook";

const UI = () => {
  const { colors, currentColorIndex, isAnimatingRef, setCurrentColorIndex } =
    useCar();

  function HandleClick(index: number) {
    if (isAnimatingRef?.current) return;

    setCurrentColorIndex(index);
  }

  return (
    <div className="ui">
      <div className="colors">
        {colors.map((C, i) => {
          return (
            <div
              key={i}
              onClick={() => HandleClick(i)}
              className={`color-box ${currentColorIndex == i ? "selected" : ""}`}
              style={{ background: '#' + C.body.getHexString() }}
            ></div>
          );
        })}
      </div>
      <div className="progress">
        <div className="line color-progress-line"></div>
      </div>
    </div>
  );
};

export default UI;
