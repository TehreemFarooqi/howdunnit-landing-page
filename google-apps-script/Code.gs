const SIGNUP_SHEET_ID_PROPERTY = "SIGNUP_SHEET_ID";
const SIGNUP_SHEET_NAME = "Signups";
const SIGNUP_HEADERS = ["Submitted at", "Email"];

function setupSignupSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error(
      "Open this script from the signup spreadsheet using Extensions > Apps Script.",
    );
  }

  let sheet = spreadsheet.getSheetByName(SIGNUP_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SIGNUP_SHEET_NAME);
  }

  const lastRow = sheet.getLastRow();
  if (lastRow === 0) {
    sheet.appendRow(SIGNUP_HEADERS);
    sheet.setFrozenRows(1);
  } else {
    const headers = sheet.getRange(1, 1, 1, SIGNUP_HEADERS.length).getValues()[0];
    if (SIGNUP_HEADERS.some((header, index) => headers[index] !== header)) {
      throw new Error(
        'The "Signups" tab already has content with unexpected headers. Rename or clear that tab before setup.',
      );
    }
  }

  const properties = PropertiesService.getScriptProperties();
  properties.setProperty(SIGNUP_SHEET_ID_PROPERTY, spreadsheet.getId());
  console.log("Signup sheet connected: " + spreadsheet.getUrl());
}

function doGet() {
  return HtmlService.createHtmlOutput(
    "This endpoint accepts signups and does not provide access to the signup sheet.",
  );
}

function doPost(event) {
  const parameters = event && event.parameter ? event.parameter : {};
  const token = /^[a-f0-9-]{36}$/i.test(parameters.token || "")
    ? parameters.token
    : "";

  if (parameters.website) {
    return createResponse_(token, true);
  }

  const email = String(parameters.email || "").trim().toLowerCase();
  if (!isValidEmail_(email)) {
    return createResponse_(token, false);
  }

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const sheetId = PropertiesService.getScriptProperties().getProperty(
      SIGNUP_SHEET_ID_PROPERTY,
    );
    if (!sheetId) {
      throw new Error("Signup sheet has not been configured.");
    }

    const spreadsheet = SpreadsheetApp.openById(sheetId);
    const sheet = spreadsheet.getSheetByName(SIGNUP_SHEET_NAME);
    if (!sheet) {
      throw new Error("Signup sheet tab is missing.");
    }

    const lastRow = sheet.getLastRow();
    const existing = lastRow > 1
      ? sheet
          .getRange(2, 2, lastRow - 1, 1)
          .createTextFinder(email)
          .matchCase(false)
          .matchEntireCell(true)
          .findNext()
      : null;

    if (!existing) {
      sheet.appendRow([new Date(), email]);
    }
    return createResponse_(token, true);
  } catch (error) {
    console.error("Could not save launch signup: " + error.message);
    return createResponse_(token, false);
  } finally {
    if (lock.hasLock()) {
      lock.releaseLock();
    }
  }
}

function isValidEmail_(email) {
  if (email.length > 254) {
    return false;
  }
  return /^[a-z0-9][a-z0-9.!#$%&'*+/=?^_`{|}~-]*@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(
    email,
  );
}

function createResponse_(token, ok) {
  const payload = JSON.stringify({
    type: "howdunnit-signup",
    token: token,
    ok: ok,
  });
  const html =
    "<!doctype html><html><body><script>window.top.postMessage(" +
    payload +
    ', "*");</script></body></html>';

  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(
    HtmlService.XFrameOptionsMode.ALLOWALL,
  );
}
