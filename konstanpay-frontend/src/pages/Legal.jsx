import AuthShell from '../components/AuthShell';
const T = {
  terms: ['Terms of Service', 'The KonstanPay Terms of Service will be published here.'],
  privacy: ['Privacy Policy', 'The KonstanPay Privacy Policy will be published here.'],
  help: ['Help & Support', 'Log in and open Support from your profile to contact our team.'],
};
export default function Legal({ page }) {
  const [title, body] = T[page];
  return <AuthShell to="/"><h1 className="h3">{title}</h1><p className="text-secondary">{body}</p></AuthShell>;
}
