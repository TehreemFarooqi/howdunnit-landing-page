const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(
  path.join(__dirname, "..", "google-apps-script", "Code.gs"),
  "utf8",
);

function createSheetHarness(initialRows = []) {
  const rows = initialRows.map((row) => [...row]);
  const sheet = {
    getLastRow: () => rows.length,
    appendRow: (row) => rows.push([...row]),
    setFrozenRows() {},
    getRange(firstRow, firstColumn, rowCount, columnCount) {
      return {
        getValues() {
          return rows
            .slice(firstRow - 1, firstRow - 1 + rowCount)
            .map((row) => row.slice(firstColumn - 1, firstColumn - 1 + columnCount));
        },
        createTextFinder(searchText) {
          let matchCase = true;
          let matchEntireCell = false;
          return {
            matchCase(value) {
              matchCase = value;
              return this;
            },
            matchEntireCell(value) {
              matchEntireCell = value;
              return this;
            },
            findNext() {
              const search = matchCase ? searchText : searchText.toLowerCase();
              const found = rows
                .slice(firstRow - 1, firstRow - 1 + rowCount)
                .some((row) => {
                  const value = String(row[firstColumn - 1] ?? "");
                  const candidate = matchCase ? value : value.toLowerCase();
                  return matchEntireCell ? candidate === search : candidate.includes(search);
                });
              return found ? {} : null;
            },
          };
        },
      };
    },
  };
  const spreadsheet = {
    getId: () => "private-sheet-id",
    getUrl: () => "https://docs.google.com/spreadsheets/d/private-sheet-id/edit",
    getSheetByName: (name) => (name === "Signups" ? sheet : null),
    insertSheet: (name) => {
      assert.equal(name, "Signups");
      return sheet;
    },
  };
  const properties = new Map();
  const context = {
    console,
    Date,
    SpreadsheetApp: {
      getActiveSpreadsheet: () => spreadsheet,
      openById: (id) => {
        assert.equal(id, "private-sheet-id");
        return spreadsheet;
      },
    },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key) => properties.get(key) || null,
        setProperty: (key, value) => properties.set(key, value),
      }),
    },
    LockService: {
      getScriptLock: () => ({
        waitLock() {},
        hasLock: () => true,
        releaseLock() {},
      }),
    },
    HtmlService: {
      XFrameOptionsMode: { ALLOWALL: "ALLOWALL" },
      createHtmlOutput: (html) => ({
        html,
        setXFrameOptionsMode() {
          return this;
        },
      }),
    },
  };

  vm.createContext(context);
  vm.runInContext(source, context);
  return { context, properties, rows };
}

test("setup connects to the bound sheet and creates a dedicated signup column", () => {
  const { context, properties, rows } = createSheetHarness();

  context.setupSignupSheet();

  assert.equal(properties.get("SIGNUP_SHEET_ID"), "private-sheet-id");
  assert.deepEqual(rows[0], ["Submitted at", "Email"]);
});

test("signup appends a normalized email to the connected sheet", () => {
  const { context, properties, rows } = createSheetHarness([
    ["Submitted at", "Email"],
  ]);
  properties.set("SIGNUP_SHEET_ID", "private-sheet-id");

  const response = context.doPost({
    parameter: {
      email: "  Person@example.com ",
    },
  });

  assert.match(response.html, /"ok":true/);
  assert.equal(rows.length, 2);
  assert.equal(rows[1][1], "person@example.com");
});

test("signup rejects invalid addresses without writing to the sheet", () => {
  const { context, properties, rows } = createSheetHarness([
    ["Submitted at", "Email"],
  ]);
  properties.set("SIGNUP_SHEET_ID", "private-sheet-id");

  const response = context.doPost({ parameter: { email: "not-an-email" } });

  assert.match(response.html, /"ok":false/);
  assert.equal(rows.length, 1);
});
