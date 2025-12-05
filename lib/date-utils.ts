import { format } from "date-fns";
import { createParser } from "nuqs";

/**
 * Custom parser for date strings in YYYY-MM-DD format.
 * Used for URL query state management with nuqs.
 *
 * @example
 * const [{ from, to }] = useQueryStates({
 *   from: dateParser.withDefault(defaultRange.from),
 *   to: dateParser.withDefault(defaultRange.to),
 * });
 */
export const dateParser = createParser({
  parse: (value) => {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  },
  serialize: (value) => format(value, "yyyy-MM-dd"),
});

/**
 * Get default date range for the last 7 days.
 * Returns an object with 'from' (6 days ago) and 'to' (today) dates.
 *
 * @returns {Object} Object containing from and to Date objects
 * @returns {Date} return.from - Date set to 6 days ago
 * @returns {Date} return.to - Date set to today
 *
 * @example
 * const defaultRange = getDefaultDateRange();
 * // Returns: { from: Date(6 days ago), to: Date(today) }
 */
export const getDefaultDateRange = () => {
  const today = new Date();
  const fromDate = new Date(today);
  fromDate.setDate(fromDate.getDate() - 6); // 6 days ago
  return {
    from: fromDate,
    to: today,
  };
};
