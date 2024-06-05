import Link from "next/link";
import { TocItem } from "remark-flexible-toc";

type MdTocProps = {
  toc: TocItem[];
};

export const MdTOC = ({ toc }: MdTocProps) => {
  if (toc.length === 0) {
    return null;
  }

  return (
    <div className="fixed z-20 top-16 bottom-0 right-[max(0px,calc(50%-45rem))] w-[17rem] py-10 overflow-y-auto hidden xl:block">
      <div className="px-2 py-10">
        <h2 className="font-semibold">On this page</h2>
        <ul>
          {toc.map((item) => (
            <li
              key={item.href}
              style={{ marginLeft: `${(item.depth - 1) * 16}px` }}
              className="px-2 py-1"
            >
              <Link href={item.href}>{item.value}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
