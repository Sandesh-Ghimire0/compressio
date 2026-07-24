import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <nav className="bg-neutral-900 px-8 py-4 text-neutral-400">
            <ul className="flex justify-center gap-8">
                <Link to="/upload">Upload</Link>
                <Link to="/archive">Archive</Link>
            </ul>
        </nav>
    );
};

export default Navbar;
