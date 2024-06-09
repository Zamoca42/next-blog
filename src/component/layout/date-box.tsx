import { CalendarRange } from "lucide-react";
import DateFormatter from "@/component/ui/date-formatter";

type Props = {
  dateString: string;
};

const DateBox = ({ dateString }: Props) => {
  return (
    <div className="flex gap-2 items-center text-sm">
      <CalendarRange className="w-4 h-4" />
      <DateFormatter dateString={dateString} />
    </div>
  );
};

export default DateBox;
