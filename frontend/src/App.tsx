import { Route, Routes } from "react-router-dom";
import Upload from "./pages/Upload";
import Archive from "./pages/Archive";
import MainLayout from "./components/MainLayout";

function App() {
    return (
        <>
            <div>
                <Routes>
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<Upload />} />
                        <Route path="/upload" element={<Upload />} />
                        <Route path="/archive" element={<Archive />} />
                    </Route>
                </Routes>
            </div>
        </>
    );
}

export default App;
