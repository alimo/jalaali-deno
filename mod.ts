export type JalaaliDate = { jy: number; jm: number; jd: number };
export type GregorianDate = { gy: number; gm: number; gd: number };

/**
 * Converts a Gregorian date to Jalaali.
 */
export function toJalaali(date: Date): JalaaliDate;
export function toJalaali(gy: number, gm: number, gd: number): JalaaliDate;
export function toJalaali(
  gy: Date | number,
  gm?: number,
  gd?: number,
): JalaaliDate {
  if (gy instanceof Date) {
    gd = gy.getDate();
    gm = gy.getMonth() + 1;
    gy = gy.getFullYear();
  }
  return d2j(g2d(gy, gm!, gd!));
}

/**
 * Converts a Jalaali date to Gregorian.
 */
export function toGregorian(jy: number, jm: number, jd: number): GregorianDate {
  return d2g(j2d(jy, jm, jd));
}

/**
 * Checks whether a Jalaali date is valid or not.
 */
export function isValidJalaaliDate(
  jy: number,
  jm: number,
  jd: number,
): boolean {
  return (
    jy >= -61 &&
    jy <= 3177 &&
    jm >= 1 &&
    jm <= 12 &&
    jd >= 1 &&
    jd <= jalaaliMonthLength(jy, jm)
  );
}

/**
 * Is this a leap year or not?
 */
export function isLeapJalaaliYear(jy: number): boolean {
  return jalCalLeap(jy) === 0;
}

/**
 * The number of days in a given month in a Jalaali year.
 */
export function jalaaliMonthLength(jy: number, jm: number): number {
  if (jm <= 6) {
    return 31;
  }
  if (jm <= 11) {
    return 30;
  }
  if (isLeapJalaaliYear(jy)) {
    return 30;
  }
  return 29;
}

/**
 * This function determines if the Jalaali (Persian) year is
 * leap (366-day long) or is the common year (365 days), and
 * finds the day in March (Gregorian calendar) of the first
 * day of the Jalaali year (jy).
 *
 * @param jy Jalaali calendar year (-61 to 3177)
 * @param withoutLeap when don't need leap (true or false) default is false
 * @returns
 *   leap: number of years since the last leap year (0 to 4)
 *   gy: Gregorian year of the beginning of Jalaali year
 *   march: the March day of Farvardin the 1st (1st day of jy)
 * @see: http://www.astro.uni.torun.pl/~kb/Papers/EMP/PersianC-EMP.htm
 * @see: http://www.fourmilab.ch/documents/calendar/
 */
export function jalCal(jy: number, withoutLeap = false): {
  leap?: number;
  gy: number;
  march: number;
} {
  validateJalaaliYear(jy);

  let jump = 0;
  let leapJ = -14;
  let jp = minJalaaliYear;
  // Find the limiting years for the Jalaali year jy.
  for (const jm of breaks) {
    jump = jm - jp;
    if (jy >= jm) {
      jp = jm;
      leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
    }
  }
  let n = jy - jp;

  // Find the number of leap years from AD 621 to the beginning
  // of the current Jalaali year in the Persian calendar.
  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) {
    leapJ += 1;
  }

  const gy = jy + 621;

  // And the same in the Gregorian calendar (until the year gy).
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;

  // Determine the Gregorian date of Farvardin the 1st.
  const march = 20 + leapJ - leapG;

  // return with gy and march when we don't need leap
  if (withoutLeap) {
    return {
      gy,
      march,
    };
  }

  // Find how many years have passed since the last leap year.
  if (jump - n < 6) {
    n = n - jump + div(jump + 4, 33) * 33;
  }
  let leap = mod(mod(n + 1, 33) - 1, 4);
  if (leap === -1) {
    leap = 4;
  }

  return {
    leap,
    gy,
    march,
  };
}

/**
 * Converts a date of the Jalaali calendar to the Julian Day number.
 *
 * @param jy Jalaali year (1 to 3100)
 * @param jm Jalaali month (1 to 12)
 * @param jd Jalaali day (1 to 29/31)
 * @returns Julian Day number
 */
export function j2d(jy: number, jm: number, jd: number): number {
  const { gy, march } = jalCal(jy, true);
  return g2d(gy, 3, march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

/**
 * Converts the Julian Day number to a date in the Jalaali calendar.
 *
 * @param jdn Julian Day number
 * @returns
 *   jy: Jalaali year (1 to 3100)
 *   jm: Jalaali month (1 to 12)
 *   jd: Jalaali day (1 to 29/31)
 */
export function d2j(jdn: number): JalaaliDate {
  const gy = d2g(jdn).gy; // Calculate Gregorian year (gy).
  let jy = gy - 621;
  const r = jalCal(jy, false);
  const jdn1f = g2d(gy, 3, r.march);
  let jd;
  let jm;
  let k;

  // Find number of days that passed since 1 Farvardin.
  k = jdn - jdn1f;
  if (k >= 0) {
    if (k <= 185) {
      // The first 6 months.
      jm = 1 + div(k, 31);
      jd = mod(k, 31) + 1;
      return { jy: jy, jm: jm, jd: jd };
    } else {
      // The remaining months.
      k -= 186;
    }
  } else {
    // Previous Jalaali year.
    jy -= 1;
    k += 179;
    if (r.leap === 1) k += 1;
  }
  jm = 7 + div(k, 30);
  jd = mod(k, 30) + 1;
  return { jy: jy, jm: jm, jd: jd };
}

/**
 * Calculates the Julian Day number from Gregorian or Julian
 * calendar dates. This integer number corresponds to the noon of
 * the date (i.e. 12 hours of Universal Time).
 * The procedure was tested to be good since 1 March, -100100 (of both
 * calendars) up to a few million years into the future.
 *
 * @param gy Calendar year (years BC numbered 0, -1, -2, ...)
 * @param gm Calendar month (1 to 12)
 * @param gd Calendar day of the month (1 to 28/29/30/31)
 * @returns Julian Day number
 */
export function g2d(gy: number, gm: number, gd: number): number {
  let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
    div(153 * mod(gm + 9, 12) + 2, 5) +
    gd -
    34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

/**
 * Calculates Gregorian and Julian calendar dates from the Julian Day number
 * (jdn) for the period since jdn=-34839655 (i.e. the year -100100 of both
 * calendars) to some millions of years ahead of the present.
 *
 * @param jdn Julian Day number
 * @returns
 *   gy: Calendar year (years BC numbered 0, -1, -2, ...)
 *   gm: Calendar month (1 to 12)
 *   gd: Calendar day of the month M (1 to 28/29/30/31)
 */
export function d2g(jdn: number): GregorianDate {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
}

/**
 * Returns Saturday and Friday day of the current week
 * (week starts on Saturday)
 *
 * @param jy jalaali year
 * @param jm jalaali month
 * @param jd jalaali day
 * @returns Saturday and Friday of the current week
 */
export function jalaaliWeek(jy: number, jm: number, jd: number): {
  saturday: JalaaliDate;
  friday: JalaaliDate;
} {
  const dayOfWeek = jalaaliToDateObject(jy, jm, jd).getDay();

  const startDayDifference = dayOfWeek == 6 ? 0 : -(dayOfWeek + 1);
  const endDayDifference = 6 + startDayDifference;

  return {
    saturday: d2j(j2d(jy, jm, jd + startDayDifference)),
    friday: d2j(j2d(jy, jm, jd + endDayDifference)),
  };
}

/**
 * Convert Jalaali calendar dates to javascript Date object
 *
 * @param jy jalaali year
 * @param jm jalaali month
 * @param jd jalaali day
 * @param [h] hours
 * @param [m] minutes
 * @param [s] seconds
 * @param [ms] milliseconds
 * @returns Date object of the jalaali calendar dates
 */
export function jalaaliToDateObject(
  jy: number,
  jm: number,
  jd: number,
  h = 0,
  m = 0,
  s = 0,
  ms = 0,
): Date {
  const { gy, gm, gd } = toGregorian(jy, jm, jd);

  return new Date(gy, gm - 1, gd, h, m, s, ms);
}

/**
 * Checks wether the jalaali year is between min and max
 */
function validateJalaaliYear(jy: number) {
  if (jy < minJalaaliYear || jy > maxJalaaliYear) {
    throw new Error(`Invalid Jalaali year ${jy}`);
  }
}

/**
 * This function determines if the Jalaali (Persian) year is a leap
 * (366-day long) or is the common year (365 days), and finds the day in March
 * (Gregorian calendar) of the first day of the Jalaali year (jy).
 *
 * @param jy Jalaali calendar year (-61 to 3177)
 * @returns number of years since the last leap year (0 to 4)
 */
function jalCalLeap(jy: number) {
  validateJalaaliYear(jy);

  let jump = 0;
  let jp = minJalaaliYear;
  for (const jm of breaks) {
    jump = jm - jp;
    if (jy >= jm) {
      jp = jm;
    }
  }

  let n = jy - jp;
  if (jump - n < 6) {
    n = n - jump + div(jump + 4, 33) * 33;
  }

  const leap = mod(mod(n + 1, 33) - 1, 4);
  if (leap === -1) {
    return 4;
  }
  return leap;
}

/**
 * Utility helper functions.
 */
function div(a: number, b: number): number {
  return ~~(a / b);
}
function mod(a: number, b: number): number {
  return a - ~~(a / b) * b;
}

/**
 * Jalaali years starting the 33-year rule.
 */
const breaks: number[] = [
  -61,
  9,
  38,
  199,
  426,
  686,
  756,
  818,
  1111,
  1181,
  1210,
  1635,
  2060,
  2097,
  2192,
  2262,
  2324,
  2394,
  2456,
  3178,
];

const minJalaaliYear = breaks[0];
const maxJalaaliYear = breaks[breaks.length - 1] - 1;
