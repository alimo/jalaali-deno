import { assertEquals } from "https://deno.land/std@0.121.0/testing/asserts.ts";
import * as j from "./mod.ts";

Deno.test("toJalaali", async (t) => {
  await t.step("should convert Gregorian to Jalaali correctly", () => {
    assertEquals(
      j.toJalaali(1981, 8, 17),
      { jy: 1360, jm: 5, jd: 26 },
    );
    assertEquals(
      j.toJalaali(2013, 1, 10),
      { jy: 1391, jm: 10, jd: 21 },
    );
    assertEquals(
      j.toJalaali(2014, 8, 4),
      { jy: 1393, jm: 5, jd: 13 },
    );
  });

  await t.step("should convert Date object to Jalaali", () => {
    assertEquals(
      j.toJalaali(new Date(1981, 8 - 1, 17)),
      { jy: 1360, jm: 5, jd: 26 },
    );
    assertEquals(
      j.toJalaali(new Date(2013, 1 - 1, 10)),
      { jy: 1391, jm: 10, jd: 21 },
    );
    assertEquals(
      j.toJalaali(new Date(2014, 8 - 1, 4)),
      { jy: 1393, jm: 5, jd: 13 },
    );
  });
});

Deno.test("toGregorian", async (t) => {
  await t.step("should convert Jalaali to Gregorian correctly", () => {
    assertEquals(
      j.toGregorian(1360, 5, 26),
      { gy: 1981, gm: 8, gd: 17 },
    );
    assertEquals(
      j.toGregorian(1391, 10, 21),
      { gy: 2013, gm: 1, gd: 10 },
    );
    assertEquals(
      j.toGregorian(1393, 5, 13),
      { gy: 2014, gm: 8, gd: 4 },
    );
  });
});

Deno.test("isValidJalaaliDate", async (t) => {
  await t.step("should check validity of a Jalaali date", () => {
    assertEquals(j.isValidJalaaliDate(-62, 12, 29), false);
    assertEquals(j.isValidJalaaliDate(-62, 12, 29), false);
    assertEquals(j.isValidJalaaliDate(-61, 1, 1), true);
    assertEquals(j.isValidJalaaliDate(3178, 1, 1), false);
    assertEquals(j.isValidJalaaliDate(3177, 12, 29), true);
    assertEquals(j.isValidJalaaliDate(1393, 0, 1), false);
    assertEquals(j.isValidJalaaliDate(1393, 13, 1), false);
    assertEquals(j.isValidJalaaliDate(1393, 1, 0), false);
    assertEquals(j.isValidJalaaliDate(1393, 1, 32), false);
    assertEquals(j.isValidJalaaliDate(1393, 1, 31), true);
    assertEquals(j.isValidJalaaliDate(1393, 11, 31), false);
    assertEquals(j.isValidJalaaliDate(1393, 11, 30), true);
    assertEquals(j.isValidJalaaliDate(1393, 12, 30), false);
    assertEquals(j.isValidJalaaliDate(1393, 12, 29), true);
    assertEquals(j.isValidJalaaliDate(1395, 12, 30), true);
  });
});

Deno.test("isLeapJalaaliYear", async (t) => {
  await t.step("should check if a Jalaali year is leap or common", () => {
    assertEquals(j.isLeapJalaaliYear(1393), false);
    assertEquals(j.isLeapJalaaliYear(1394), false);
    assertEquals(j.isLeapJalaaliYear(1395), true);
    assertEquals(j.isLeapJalaaliYear(1396), false);
  });
});

Deno.test("jalaaliMonthLength", async (t) => {
  await t.step(
    "should return number of days in a given Jalaali year and month",
    () => {
      assertEquals(j.jalaaliMonthLength(1393, 1), 31);
      assertEquals(j.jalaaliMonthLength(1393, 4), 31);
      assertEquals(j.jalaaliMonthLength(1393, 6), 31);
      assertEquals(j.jalaaliMonthLength(1393, 7), 30);
      assertEquals(j.jalaaliMonthLength(1393, 10), 30);
      assertEquals(j.jalaaliMonthLength(1393, 12), 29);
      assertEquals(j.jalaaliMonthLength(1394, 12), 29);
      assertEquals(j.jalaaliMonthLength(1395, 12), 30);
    },
  );
});

Deno.test("jalaaliToDateObject", async (t) => {
  await t.step(
    "should return javascript Date object for Jalaali date in a given Jalaali year, month and day",
    () => {
      assertEquals(
        j.jalaaliToDateObject(1400, 4, 30),
        new Date(2021, 6, 21),
      );
      assertEquals(
        j.jalaaliToDateObject(1399, 12, 20),
        new Date(2021, 2, 10),
      );
      assertEquals(
        j.jalaaliToDateObject(1397, 5, 13),
        new Date(2018, 7, 4),
      );
    },
  );
});

Deno.test("jalaaliToDateObject with time params", async (t) => {
  await t.step(
    "should return javascript Date object for Jalaali date in a given Jalaali year, month, and day and also time params like hours, minutes, seconds, and milliseconds",
    () => {
      assertEquals(
        j.jalaaliToDateObject(1400, 4, 30, 3),
        new Date(2021, 6, 21, 3),
      );
      assertEquals(
        j.jalaaliToDateObject(1399, 12, 20, 23, 20),
        new Date(2021, 2, 10, 23, 20),
      );
      assertEquals(
        j.jalaaliToDateObject(1397, 5, 13, 25, 52, 100),
        new Date(2018, 7, 4, 25, 52, 100),
      );
    },
  );
});
