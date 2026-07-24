import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const MainLayout = () => {
    return (
        <div>
            <Navbar />
            <div className="flex-1 mx-auto w-full max-w-7xl px-6 py-8">
                <Outlet />
            </div>
        </div>
    );
};

export default MainLayout;
