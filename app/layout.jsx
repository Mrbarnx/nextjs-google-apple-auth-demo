import "./globals.css";
import AuthSessionProvider from "@/components/session-provider";

export const metadata = {
  title: "Social Signup Demo",
  description: "Google and Apple signup buttons with redirect flow",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
