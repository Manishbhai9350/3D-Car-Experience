import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

interface Size {
  width: number;
  height: number;
}

interface WindowReturn {
  size: Size;
  setSize: Dispatch<SetStateAction<Size>>;
}

const useWindow = (): WindowReturn => {
  const [state, setState] = useState<Size>({
    width: innerWidth,
    height: innerHeight,
  });

  useEffect(() => {

    const Resize = () => {
        setState({
            width:innerWidth,
            height: innerHeight
        })
    };

    Resize();

    window.addEventListener("resize", Resize);

    return () => {
      window.removeEventListener("resize", Resize);
    };
  }, []);

  return {
    size: state,
    setSize: setState,
  };
};

export default useWindow;
