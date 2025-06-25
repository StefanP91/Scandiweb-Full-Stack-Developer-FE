import { Outlet } from "react-router";

import '../index.css';

const Main = () => {
  return (
    <main className="flex-grow-1 position-relative h-100">
        <Outlet />
    </main>
  );
}

export default Main;