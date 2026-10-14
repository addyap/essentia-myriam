// Public contact endpoints. Base64 is a storage convention, not spam protection.
// RevealContact renders accessible links in the initial server HTML.
import { TEST_MODE } from './config.js';

export const CONTACT = {
  email: 'bWRiY2hhbmRhbGVAZ21haWwuY29t',       // mdbchandale@gmail.com
  phone: 'KzMzICgwKTYgMDEgMzAgMDYgNDI=',        // +33 (0)6 01 30 06 42
  wa: TEST_MODE
    ? 'MzM2NDk4Mjk4MjY='                         // 33649829826 — Antony, test mode only
    : 'MzM2MDEzMDA2NDI=',                        // 33601300642
};
