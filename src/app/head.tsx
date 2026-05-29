import Script from "next/script";

export default function Head() {
  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-L8MK82ZMPY"
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);} 
            gtag('js', new Date());
            gtag('config', 'G-L8MK82ZMPY');
          `,
        }}
      />
    </>
  );
}
