import { FC, memo } from "react";

const category =
  'flex items-center space-x-1 rounded-md px-2 py-3 hover:bg-gray-100 hover:text-blue-600';

const Sidebar: FC = memo(() => {
  return (
    <aside className="flex w-72 flex-col space-y-2 border-r-2 border-gray-200 bg-white p-2">
      <div className="flex items-center justify-center mt-10">
        <a href="/">Encrypted Notes</a>
      </div>
      <nav className="mit-10">
        <a href="/newNote" className={category}>
          <span>New Note</span>
        </a>
        <a href="/notes" className={category}>
          <span>Your Notes</span>
        </a>
        <a href="/devices" className={category}>
          <span>Devices</span>
        </a>
        <a href="/" className={category}>
          <span>Logout</span>
        </a>
      </nav>
    </aside>
  );
});

export default Sidebar;
