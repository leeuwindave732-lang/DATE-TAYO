import {Link} from "react-router-dom";

const Navbar = () => {
    return (
        <nav className="flex justify-between items-center px-6 py-4 bg-black text-white">
            <h1 className="text-xl font-bold">Date Tayo!</h1>
            <div className="flex gap-4">
                <Link to="/">Home</Link>
                <Link to="/login">Login</Link>
                <Link to="/signup">SignUP</Link>
                <Link to="/map">Map</Link>
            </div>
        </nav>
    );
};

export default Navbar;