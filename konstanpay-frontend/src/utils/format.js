// Display-only formatting. Amounts arrive from the API as decimal STRINGS; never do money maths on them here.
export const ngn = (v) => '₦' + Number(v ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const money = (m) => (!m ? '—' : m.currency === 'NGN' ? ngn(m.value) : `${m.value} ${m.currency}`);
export const dateTime = (iso) => new Date(iso).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' });
export const TYPE_LABELS = { conversion: 'Crypto → NGN', swap: 'Crypto swap', purchase: 'Crypto purchase', deposit: 'Deposit', crypto_withdrawal: 'Crypto withdrawal', bank_withdrawal: 'Bank withdrawal', airtime: 'Airtime', data: 'Mobile data', electricity: 'Electricity', cable: 'Cable TV' };
export const shortDate = (iso) => new Date(iso).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
