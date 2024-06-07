import { format } from "date-fns";

type Props = {
  dateString: string;
};

const DateFormatter = ({ dateString }: Props) => {
  if (!dateString) {
    return null;
  }
  return <time dateTime={dateString}>{format(dateString, "LLLL	d, yyyy")}</time>;
};

export default DateFormatter;
