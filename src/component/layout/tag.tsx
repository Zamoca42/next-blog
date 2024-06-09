import { Tags } from "lucide-react";
import { Badge } from "@/component/ui/badge";

type Props = {
  tags: string[];
};

const Tag = ({ tags }: Props) => {
  return (
    <div className="flex items-center gap-2">
      <Tags className="w-4 h-4" />
      <div className="space-x-1">
        {tags.map((name) => (
          <Badge key={name} variant="outline">{name}</Badge>
        ))}
      </div>
    </div>
  );
};

export default Tag;
