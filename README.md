# howdunnit | landing page

The static landing page for Howdunnit, a free, open-source, local-first Windows meeting sidekick for developers.

## Preview

Open `index.html` directly, or serve this directory with any static file server. No build step or runtime dependencies are required.

The page loads Bricolage Grotesque and Martian Mono from Google Fonts. Launch signups are saved to a private Google Sheet by the Google Apps Script in `google-apps-script/Code.gs`. No emails are sent automatically.

## Set up the signup sheet

The Apps Script source is public, but it contains no spreadsheet ID, credentials, or subscriber data. The spreadsheet ID is saved in the script project's private Script Properties. The web app only accepts email submissions; it has no route for reading or sharing the sheet.

1. Sign in to your Google account and create a new project at <https://script.google.com/>.
2. Replace the starter code with `google-apps-script/Code.gs` and save.
3. Select `setupSignupSheet` in the function menu and click **Run**. Review Google's authorization prompt. The script creates a private spreadsheet in your Drive, stores its ID in Script Properties, and logs its URL for you.
4. Choose **Deploy > New deployment > Web app**. Set **Execute as** to **Me** and **Who has access** to **Anyone**, then deploy and authorize. This makes the submission endpoint public, not the spreadsheet. Do not change the spreadsheet's sharing settings.
5. Copy the web app URL, which ends in `/exec`, into the `data-endpoint` attribute on `#signup-form` in `index.html`. The URL is public and is not a credential. Never put the spreadsheet ID or subscriber data in this repository.
6. Publish the site. Submit a test address and confirm it appears in the private sheet. The site displays a success message only after the Apps Script confirms it saved the signup.

The public form uses a hidden honeypot, validates addresses, and avoids adding the same address twice. If the endpoint is not configured or a save fails, it displays an error instead of claiming success. Submissions are stored for manual launch updates; the script does not send email.

## Publish

This site is published with GitHub Pages at <https://howdunnit.com/>.

## License

MIT. See [LICENSE](LICENSE).
