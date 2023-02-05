import { FC } from "react";
import { Link } from "react-router-dom";

const category =
  'flex items-center space-x-1 rounded-md px-2 py-3 hover:bg-gray-100 hover:text-blue-600';

const Sidebar: FC = () => {
  return (
    <aside className="flex w-72 flex-col space-y-2 border-r-2 border-gray-200 bg-white p-2">
      <div className="flex items-center justify-center mt-10">
        <Link to="/">Encrypted Notes</Link>
      </div>
      <nav className="mit-10">
        <Link to="/new" className={category}>
          <span>New Note</span>
        </Link>
        <Link to="/notes" className={category}>
          <span>Your Notes</span>
        </Link>
        <Link to="/devices" className={category}>
          <span>Devices</span>
        </Link>
        <Link to="/" className={category}>
          <span>Logout</span>
        </Link>
      </nav>
    </aside>
  )
}

export default Sidebar;
