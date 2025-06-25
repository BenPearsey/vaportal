import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <>
      {/* Light mode logo */}
      <img {...props} src="/logo2.png" alt="App Logo" className="block dark:hidden" />
      {/* Dark mode logo */}
      <img {...props} src="/white-logo.png" alt="App Logo" className="hidden dark:block" />
    </>
  );
}
