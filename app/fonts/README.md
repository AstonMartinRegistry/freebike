Drop your custom font files here.

Recommended:
- Use WOFF2 (best) or WOFF. You can also include TTF/OTF if you must.
- Create a subfolder per family, e.g. `app/fonts/MyNewFont/`.
- Name files clearly, e.g. `MyNewFont-Regular.woff2`, `MyNewFont-Italic.woff2`, `MyNewFont-Bold.woff2`.

How to load with next/font/local (example):

```tsx
// app/layout.tsx
import localFont from "next/font/local";

const myNewFont = localFont({
  src: [
    { path: "./fonts/MyNewFont/MyNewFont-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/MyNewFont/MyNewFont-Italic.woff2",  weight: "400", style: "italic" },
    // Add more weights/styles as needed
  ],
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={myNewFont.className}>{children}</body>
    </html>
  );
}
```

After you add files here, restart the dev server if it doesn't pick them up automatically.


