# howdunnit | landing page

The static landing page for Howdunnit, a free, open-source, local-first Windows meeting sidekick for developers.

## Preview

Open `index.html` directly, or serve this directory with any static file server. No build step or runtime dependencies are required.

The page loads Bricolage Grotesque and Martian Mono from Google Fonts. Launch signups are saved to a private Google Sheet by the Google Apps Script in `google-apps-script/Code.gs`. No emails are sent automatically.

## Connect the signup form to a private Google Sheet

The Apps Script source in this public repository contains no spreadsheet ID, credentials, or subscriber data. It writes submissions to the spreadsheet that you bind it to; the sheet ID is stored only in that private Apps Script project's Script Properties. The web app accepts signups but has no route for reading or sharing the sheet.

1. Sign in to the Google account that owns the signup spreadsheet. In its **Share** settings, keep **General access** set to **Restricted**. Do not select **Anyone with the link**.
2. Open that spreadsheet and choose **Extensions > Apps Script**. This creates a script bound to that spreadsheet.
3. Replace the editor contents with `google-apps-script/Code.gs` and save.
4. Select `setupSignupSheet` in the function menu and click **Run**. Review Google's authorization prompt. The function creates a `Signups` tab with `Submitted at` and `Email` columns if needed, then stores this spreadsheet's ID in the private script properties.
5. Choose **Deploy > New deployment > Web app**. Set **Execute as** to **Me** and **Who has access** to **Anyone**, then deploy and authorize. **Anyone** applies only to the form-submission endpoint; the spreadsheet stays Restricted. The endpoint can append valid submitted email addresses, but cannot read or share the sheet. Do not publish the spreadsheet ID or change its sharing settings.
6. Put the deployed `/exec` URL in the `data-endpoint` attribute on `#signup-form` in `index.html`. The endpoint URL is public and is not a credential.
7. Publish the site and submit a controlled test address. Confirm it appears once in the private `Signups` tab. The success state appears only after the Apps Script confirms the write.

The form uses a hidden honeypot, validates addresses, and avoids adding the same address twice. If the endpoint is not configured or a save fails, it displays an error instead of claiming success. Submissions are stored for manual launch updates; the script does not send email. Since the endpoint is public, it can receive spam submissions; keep the sheet Restricted and review the signup list.

## Publish

This site is published with GitHub Pages at <https://howdunnit.com/>.

## License

MIT. See [LICENSE](LICENSE).
