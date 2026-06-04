# TODO - Fix email sending fail

- [x] Step 1: Update `backend/utils/sendEmail.js` to harden nodemailer configuration
  - [x] Add env validation (host/port/user/pass/from)
  - [x] Fix port/secure handling more safely
  - [x] Improve error logs for easier debugging
- [x] Step 2: Run a quick node syntax check / lint via `npm run start` or minimal import test
- [ ] Step 3: Trigger email endpoint(s) and verify logs show successful sending
- [ ] Step 4 (if needed): Update SMTP vars (MAIL_TRAP_*) based on the error log and retry




