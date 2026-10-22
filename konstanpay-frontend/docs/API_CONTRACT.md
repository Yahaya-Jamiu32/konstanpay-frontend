# KonstanPay – API contract (frontend ⇄ backend)

The frontend calls **only** `src/services/live.js`. Every function there maps to an endpoint below.
The in-browser demo (`src/services/mock.js`) returns the same shapes, so it doubles as an executable example.
If the backend needs a different shape, change `live.js` (one file) — pages are not affected as long as the returned objects match.

## Conventions
- Base path `/api` (set `VITE_API_BASE_URL`). JSON only. HTTPS in production.
- **Envelope** – success: `{ "success": true, "data": … }`; failure: `{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Human readable", "fields": { "amount": "Insufficient balance." } } }`.
- **Auth** – httpOnly, Secure, SameSite session cookie (frontend sends `credentials: 'include'`). No tokens in JS storage. 401 → frontend clears user and redirects to login.
- **CSRF** – double-submit: backend sets readable cookie `csrf_token`; frontend echoes it in `X-CSRF-Token` on non-GET requests. (Change `http.js` if you choose another scheme.)
- **CORS** – if API is on another origin: allow the frontend origin, `Access-Control-Allow-Credentials: true`.
- **Money** – always **decimal strings** (`"150000.00"`), never floats. Shape `{ "value": "150000.00", "currency": "NGN" }`. The frontend does display formatting only; all amounts/fees/limits/balances are computed server-side.
- **Idempotency** – every money-moving POST (`/conversions`, `/swaps`, `/utilities/payments`, future purchase/withdrawal) receives `Idempotency-Key: <uuid>`. Same key ⇒ return the original result, never process twice.
- **Statuses** – `pending | processing | completed | failed | cancelled`. Only provider-confirmed events may set `completed`.
- **Timestamps** – ISO 8601 UTC. **IDs** – opaque strings.
- **Error codes used by UI** – `VALIDATION_ERROR` (422, with `fields`), `INVALID_CREDENTIALS` (401), `UNAUTHENTICATED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `QUOTE_EXPIRED` (409), `INVALID_OTP` (422), `PROVIDER_NOT_CONFIGURED` (503), `RATE_LIMITED` (429).
- Never reveal whether an email/phone exists (login, forgot-password).

## Objects
```
User        { id, name, email, phone, role: "user"|"admin", phoneVerified: bool, kycStatus: "not_started"|"pending"|"approved"|"rejected" }
Asset       { symbol, name, available: "0.0075", priceNgn: "150000000", valueNgn: "1125000.00" }
Transaction { id, reference, type, status, createdAt, amount: Money, fee: Money|null, description, providerReference: string|null, simulated: bool }
            type ∈ conversion|swap|purchase|deposit|crypto_withdrawal|bank_withdrawal|airtime|data|electricity|cable
Quote       { id, from, to, amount: "0.001", rate: { value, label }, fee: Money, networkFee?: Money (swaps), receive: Money, expiresAt }
```

## Endpoints
| Method & path | Request | Response `data` |
|---|---|---|
| `POST /auth/register` | `{name,email,phone,password}` | `User` (logs user in; `phoneVerified:false`). Duplicate email → 422 generic message. |
| `POST /auth/login` | `{identifier,password}` (email or phone) | `User` |
| `GET /auth/google` | – | Browser redirect: starts Google OAuth, then redirects back to the app with the session cookie set (new users land on `/verify-phone` if phone unverified) |
| `POST /auth/logout` | – | `null` |
| `GET /auth/me` | – | `User` or 401 |
| `POST /auth/verify-phone` | `{code}` (6 digits) | `User` (updated) |
| `POST /auth/resend-otp` | – | `{}`; 429 if too soon; 503 if no SMS provider |
| `POST /auth/forgot-password` | `{email}` | `{accepted:true}` – always, regardless of existence |
| `POST /auth/reset-password` | `{token,password}` | `{}` – single-use, expiring token |
| `GET /dashboard` | – | `{ totalNgn, ngnAvailable, cryptoValueNgn, assets: Asset[] (each with `changePct`: number, 7d), recent: Transaction[] (≤4), portfolio: { changePct7d: number, series: { "1D": string[], "1W": string[], "1M": string[], "1Y": string[] } } }` (series = portfolio values in NGN, oldest→newest) |
| `GET /wallet` | – | `{ ngn:{available}, assets: Asset[], simulated }` |
| `GET /wallet/deposit-instructions?asset=&network=` | – | `{asset,network,available:bool,address:string|null,minimum?,confirmations?,reason?}`. Return `available:false` + `reason` if no custody provider. Never fabricate addresses. |
| `POST /conversions/quote` | `{from:"BTC",to:"NGN",amount:"0.001"}` | `Quote`. Validate pair, min/max, balance → 422 with `fields`. Quote TTL ≈30 s. |
| `POST /conversions` | `{quoteId}` + `Idempotency-Key` | `Transaction`. Expired → 409 `QUOTE_EXPIRED`. Debit/credit in one DB transaction + ledger entries. |
| `POST /swaps/quote` | `{from,to,amount}` | `Quote` |
| `POST /swaps` | `{quoteId}` + `Idempotency-Key` | `Transaction` |
| `GET /transactions?q=&status=&page=&types=` (`types` = comma list, e.g. `airtime,data,electricity,cable`) | – | `{ items: Transaction[], page, pageCount }` (page size 10, **own transactions only**) |
| `GET /transactions/:id` | – | `Transaction` (404 if not the caller's) |
| `GET /utilities/providers?service=airtime\|data\|electricity\|cable` | – | `{ service, providers:[{id,name}], plans:[{id,name,amount}], limits:{min,max} }` – from the real provider only |
| `POST /utilities/validate-customer` | `{service,provider,recipient}` | `{customerName}` – meter/smartcard lookup from the provider; 422 `fields.recipient` if invalid |
| `POST /utilities/quote` | `{service,provider,recipient,amount:"2000"}` | `{id,service,provider,recipient,amount,fee,total,customerName:string|null}` (validate meter/smartcard/phone here) |
| `POST /utilities/payments` | `{quoteId}` + `Idempotency-Key` | `Transaction` (electricity tokens only if returned by provider) |
| `GET /notifications` | – | `{ items:[{id,title,createdAt,read}] }` |
| `PATCH /notifications/read-all` | – | `null` |
| `GET /admin/overview?range=7d\|30d` | – | `{ users:{total,deltaPct}, verified:{total,rate}, volume:{valueNgn,deltaPct}, pending:{kyc,disputed}, trend:{labels:string[],volume:string[],registrations:string[]}, kycQueue:[{id,name,idType,submittedAt}], status:[{name,state:"online"\|"degraded"\|"offline"\|"operational",detail?}], recent:[Transaction & {userEmail}] }` – role `admin` only |

## Additional endpoints (all implemented in `live.js` and `mock.js`)
| Method & path | Request | Response `data` |
|---|---|---|
| `GET /assets/:symbol` | – | `Asset & { history: string[] (30 prices), historySimulated, pricesSimulated, recent: Transaction[] }` – only supported assets; real market data only from a genuine provider |
| `POST /purchases/quote` | `{asset, amountNgn}` | `{id, asset, pay:Money, fee:Money, receive:Money, rate:{label}, paymentMethod, eta, expiresAt}` |
| `POST /purchases` | `{quoteId}` + `Idempotency-Key` | `Transaction` with status `pending` until provider payment webhook is verified |
| `GET /bank-accounts/banks` | – | `{items:[{code,name}]}` |
| `GET /bank-accounts` | – | `{items:[{id,bankCode,bankName,accountNumberMasked,accountName,verified}]}` |
| `POST /bank-accounts/verify` | `{bankCode,accountNumber}` | `{bankCode,accountNumberMasked,accountName}` from the name-enquiry provider; 503 `PROVIDER_NOT_CONFIGURED` if unavailable (never invent names) |
| `POST /bank-accounts` | `{bankCode,accountNumber}` | saved account (only after successful verification) |
| `POST /bank-withdrawals/quote` | `{bankAccountId,amount}` | `{id,account,accountName,amount,fee,receive,expiresAt}` |
| `POST /bank-withdrawals` | `{quoteId}` + `Idempotency-Key` | `Transaction` (`pending` → `processing` → `completed/failed` via provider webhook) |
| `POST /crypto-withdrawals/quote` | `{asset,network,address,amount}` | `{id,asset,network,address,amount,networkFee,serviceFee,receive,expiresAt}`; validate address per network; require step-up auth before create |
| `POST /crypto-withdrawals` | `{quoteId}` + `Idempotency-Key` | `Transaction` |
| `GET /kyc` | – | `{status:"not_started"\|"pending"\|"approved"\|"rejected", submittedAt?, reason?}` |
| `POST /kyc` | `{fullName,dob,idType,idNumber}` | `{status:"pending"}` – never auto-approve. Document upload via identity-provider SDK/flow (not in this UI yet). |
| `GET /support/tickets` | – | `{items:[{id,subject,category,status,createdAt}]}` |
| `POST /support/tickets` | `{subject,category,message}` | ticket |
| `GET /user/security` | – | `{twoFactorAvailable,twoFactorEnabled,sessions:[{id,device,lastActive,current}],loginHistory:[]}` |
| `POST /user/change-password` | `{current,next}` | `{}`; 422 `fields.current` if wrong |
| `GET /admin/users?q=` | – | `{items:[{id,name,email,role,status:"active"\|"suspended",kycStatus}]}` |
| `PATCH /admin/users/:id/status` | `{status}` | `{id,status}` – must write an audit log entry |
| `GET /admin/transactions?q=&status=` | – | `{items: Transaction[]}` – read-only |
| `GET /admin/kyc` | – | `{items:[{id,userId,name,idType,submittedAt}]}` pending KYC submissions |
| `POST /admin/kyc/:id/decision` | `{decision:"approve"\|"reject", reason?}` | `{id,status}` – reason required for reject; must write an audit log entry |
| `GET /admin/audit-logs` | – | `{items:[{id,actor,action,record,createdAt}]}` |

## Still not in the UI
admin support-ticket replies, admin provider/system configuration pages, portfolio performance chart with 1D/1W/1M/1Y filters, real-time updates (WebSocket or polling for `transaction.updated`), receipt download/share beyond print.

## Backend must enforce (frontend checks are UX only)
Validation, limits, balances, fees, rates; ownership checks on every record; RBAC; rate limiting; webhook signature verification and de-duplication; immutable ledger; audit logging; secrets only in server env vars; AML/KYC and regulatory requirements decided by Nigerian legal/compliance advisers.
