import React from "react";
import { useCar } from "../../context/car/car.hook";
import RadialWheel from "./wheel";
import { UseAudio } from "../../context/audio/audio.context";

const UI = () => {
  const { colors, currentColorIndex, isAnimatingRef, setCurrentColorIndex } =
    useCar();

  const { played, setPlayed, radial, setRadial } = UseAudio();

  function HandleClick(index: number) {
    if (isAnimatingRef?.current) return;

    setCurrentColorIndex(index);
  }
  return (
    <>
      <div className="buttons">
        <div
          onClick={() => {
            if (played) {
              setRadial((p) => !p);
            }
          }}
          className={`wheel button ${played && radial && "enabled"}`}
        >
          <div className="radial">
            <RadialWheel />
          </div>
          <div className="button-line"></div>
        </div>
        <div
          onClick={() => {
            setPlayed((p) => {
              setRadial(!p);
              return !p;
            });
          }}
          className={`sound button ${played && "enabled"}`}
        >
          <div className="button-line"></div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 512 512"
          >
            <path
              fill="#ffffff"
              d="m376.1 177.3l-16.4 39.4c15.4 6.4 26.2 21.6 26.2 39.4c0 17.7-10.8 32.9-26.2 39.4l16.4 39.4c30.8-12.9 52.5-43.3 52.5-78.8c.1-35.6-21.6-66-52.5-78.8zm-288.8-28v213.3h85.3L322 512V0L172.7 149.3H87.3z"
            ></path>
          </svg>
        </div>
      </div>
      <div className="ui">
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
    </>
  );
};

export default UI;
