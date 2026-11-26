# Short climbing-session links

The admin message generator saves the chosen language, cliff, date, time, duration,
and optional price in Cloudflare Workers KV. It returns an opaque URL such as
`https://climbing-cyprus.com/s/<16-character-code>`. No customer name, contact
information, waiver, or password is stored in the activity record.

The `/s/:code` Pages Function serves the existing activity template at that URL,
without redirecting to a URL containing the details. Language switching keeps the
same code and adds only `?lang=he` or `?lang=en`. Existing query-based activity
links remain supported. Records have no expiry and survive site deployments.

## Production configuration

In the existing Cloudflare Pages project `climbing-cypeus`, production needs:

- KV binding `CLIMBING_SESSIONS`, connected to the dedicated
  `climbing-cyprus-sessions` namespace.
- Secret `CLIMBING_ADMIN_PASSWORD`, containing the existing panel password.
  This secret must be configured in Cloudflare, never committed to Git.

Create the bindings before deployment; settings apply to the next deployment.
The existing Git integration deploys `functions/` automatically on a push to
`main`. Preview deployments require their own bindings/secrets if used for testing.

Saving requires the panel password. A fresh panel login fills it into the message
builder for the current page; after a page reload, enter it in the builder's
password field. It is sent only in the HTTPS request body to the same site's API,
never in a URL or the saved record. There is no new password to remember.

Missing configuration or a failed save produces an error, with copying disabled.
Unknown activity codes return a bilingual 404 instead of displaying default
activity information. A temporary storage failure returns 503. Personalized
responses use `no-store`, `noindex` and `no-referrer`.

These links hide activity parameters from the address bar; they do not make the
activity information confidential. Anyone with a link can view its details.
Workers KV is eventually consistent, so a new link may take a short time to appear
in other Cloudflare regions.

## Verification

```sh
node --experimental-default-type=module --test tests/climbing-short-links.test.mjs
npx wrangler pages functions build --outdir /tmp/climbing-functions-build
```

For a local preview, bind a local KV namespace and use a disposable test password:

```sh
npx wrangler pages dev . --port 8788 --kv CLIMBING_SESSIONS \
  --binding CLIMBING_ADMIN_PASSWORD=local-test-password
```

Verify saving from the panel, both languages, optional and zero prices, opening
and refreshing the short link, the waiver/map links, invalid codes, and a legacy
query-based activity link. Keep test records separate from real bookings.
