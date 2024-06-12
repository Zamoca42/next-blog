"use client";

import { Tags } from "lucide-react";
import { Badge } from "@/component/ui/badge";
import { useEffect, useState } from "react";

type Props = {
  tags: string[];
};

const Tag = ({ tags }: Props) => {
  const [visibleTags, setVisibleTags] = useState(tags);

  useEffect(() => {
    const handleResize = () => {
      const containerWidth = document.documentElement.clientWidth;
      if (containerWidth < 768) {
        setVisibleTags(tags.slice(0, 1));
      } else {
        setVisibleTags(tags);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [tags]);

  return (
    <div className="flex items-center gap-2">
      <Tags className="w-4 h-4" />
      <div className="space-x-1">
        {visibleTags.map((name) => (
          <Badge
            key={name}
            variant="outline"
            className="text-muted-foreground"
          >
            {name}
          </Badge>
        ))}
        {visibleTags.length < tags.length && (
          <Badge variant="outline" className="text-muted-foreground">
            +{tags.length - visibleTags.length}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default Tag;