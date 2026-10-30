// Customer-specific page with nothing worth ranking - keep it out of the index.
export const metadata = {
  title: "Track Your Order",
  robots: { index: false, follow: true },
};

export default function Layout({ children }) {
  return children;
}
