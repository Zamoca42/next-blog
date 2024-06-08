import clsx from "clsx";
import { format } from "date-fns";

type Props = {
  dateString: string;
  className?: string;
};

const DateFormatter = ({ dateString, className }: Props) => {
  if (!dateString) {
    return null;
  }
  return <time dateTime={dateString} className={clsx(className)}>{format(dateString, "LLLL	d, yyyy")}</time>;
};

export default DateFormatter;
