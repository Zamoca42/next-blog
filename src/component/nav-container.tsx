import { Folder } from "@/interface/folder";
import Link from "next/link";

interface Props {
  folders: Folder[];
  toggleMenu: () => void;
}

export const NavContainer = ({ folders, toggleMenu }: Props) => {
  return (
    <div className="flex flex-col justify-center items-center space-y-4 p-4 m-10">
      <Link href="/" onClick={toggleMenu}>
        Home
      </Link>
      <hr className="border-gray-200 min-w-72" />
      {folders.map((folder) => (
        <Link
          href={`/post/${folder.posts[0].slug}`}
          key={folder.path}
          onClick={toggleMenu}
        >
          {folder.name}
        </Link>
      ))}
    </div>
  );
};
