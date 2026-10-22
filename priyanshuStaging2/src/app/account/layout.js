import AccountClientLayout from "./AccountClientLayout";

export const metadata = {
  title: "Account | PrEqt",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AccountLayout({ children }) {
  return <AccountClientLayout>{children}</AccountClientLayout>;
}
