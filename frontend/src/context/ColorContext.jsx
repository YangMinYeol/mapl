import { createContext, useContext, useEffect, useState } from "react";
import { fetchColor } from "../api/color";
import { useModal } from "./ModalContext";

const ColorContext = createContext([]);

export function ColorProvider({ children }) {
  const [colors, setColors] = useState([]);
  const {openModal} = useModal();

  useEffect(() => {
    const fetchData = async () => {
      try{
        const colorData = await fetchColor();
        setColors(colorData);

      } catch(error){
        openModal(error.message);
      }
    };

    fetchData();
  }, []);

  return (
    <ColorContext.Provider value={colors}>{children}</ColorContext.Provider>
  );
}

export const useColors = () => useContext(ColorContext);
