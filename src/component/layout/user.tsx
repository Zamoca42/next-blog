"use client";

import Link from "next/link";
import { CircleUser } from "lucide-react";

type Props = {
  name: string;
  url: string;
};

const User = ({ name, url }: Props) => {
  return (
    <div className="flex items-center gap-2">
      <CircleUser className="w-4 h-4" />
      <Link className="text-sm" href={url}>
        {name}
      </Link>
    </div>
  );
};

export default User;
