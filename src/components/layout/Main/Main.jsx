import { Outlet } from "react-router";
import { useOverlay } from "../../../contexts/OverlayContext";
import { useEffect } from "react";

import style from './Main.module.css'

const Main = () => {
  const { isOverlayActive, isBodyScrollDisabled } = useOverlay();

  useEffect(() => {
        document.body.style.overflow = isBodyScrollDisabled ? 'hidden' : 'auto';
        return () => { document.body.style.overflow = 'auto'; };
  }, [isBodyScrollDisabled]);

  return (
    <main className={`flex-grow-1 position-relative h-100 ${isOverlayActive ? style.overlayActive : ''}`}>
        <Outlet />
    </main>
  );
}

export default Main;