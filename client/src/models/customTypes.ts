import { DateTime } from "luxon";
import { types } from "mobx-state-tree";

type ValidationFn<T> = (value: string) => T;

const CustomDateType = (
  name: string,
  fromSnapshot: ValidationFn<DateTime>,
  toSnapshot: (value: DateTime) => string,
) => {
  return types.custom<string, DateTime>({
    name,
    fromSnapshot,
    toSnapshot,
    isTargetType(value: string | DateTime): boolean {
      return value instanceof DateTime;
    },

    getValidationMessage(value: string) {
      return fromSnapshot(value).isValid ? "" : `Invalid date supplied to ${name}`;
    },
  });
};

const ISODateTime = CustomDateType(
  "ISODateTime",
  (v) => DateTime.fromISO(v, { setZone: true }),
  (v) => v.toISO()!,
);

export { ISODateTime };
