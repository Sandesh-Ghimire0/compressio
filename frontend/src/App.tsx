import { Route, Routes } from "react-router-dom";
import Compress from "./pages/Compress";
import Archive from "./pages/Archive";
import MainLayout from "./components/MainLayout";

function App() {
    return (
        <>
            <div>
                <Routes>
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<Compress />} />
                        <Route path="/compress" element={<Compress />} />
                        <Route path="/archive" element={<Archive />} />
                    </Route>
                </Routes>
            </div>
        </>
    );
}

export default App;
