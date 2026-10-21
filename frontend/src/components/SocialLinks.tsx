type Links = { facebook?: string; instagram?: string; twitter?: string; youtube?: string; linkedin?: string };

const ICONS: { key: keyof Links; label: string; bg: string; d: string }[] = [
  { key: "facebook", label: "Facebook", bg: "#1877f2", d: "M22 12.07C22 6.5 17.52 2 12 2S2 6.5 2 12.07c0 5.02 3.66 9.19 8.44 9.93v-7.03H7.9v-2.9h2.54V9.86c0-2.52 1.49-3.91 3.78-3.91 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22c4.78-.74 8.44-4.91 8.44-9.93z" },
  { key: "instagram", label: "Instagram", bg: "#e1306c", d: "M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 7a5 5 0 100 10 5 5 0 000-10zm0 8.25a3.25 3.25 0 110-6.5 3.25 3.25 0 010 6.5zM17.3 5.5a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z" },
  { key: "youtube", label: "YouTube", bg: "#ff0000", d: "M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 00.5 6.2 31 31 0 000 12a31 31 0 00.5 5.8 3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1A31 31 0 0024 12a31 31 0 00-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" },
  { key: "twitter", label: "Twitter / X", bg: "#000000", d: "M18.9 2H22l-7.5 8.6L23.3 22h-6.9l-5.4-7-6.2 7H1.7l8-9.2L1.2 2h7.1l4.9 6.4L18.9 2zm-1.2 18h1.9L7.1 3.9H5.1L17.7 20z" },
  { key: "linkedin", label: "LinkedIn", bg: "#0a66c2", d: "M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" },
];

export default function SocialLinks({ links, className = "" }: { links?: Links; className?: string }) {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {ICONS.map((i) => (
        <a key={i.key} href={links?.[i.key]?.trim() || "#"} target={links?.[i.key]?.trim() ? "_blank" : undefined} rel="noopener noreferrer" aria-label={i.label} title={i.label}
          style={{ backgroundColor: i.bg }} className="w-10 h-10 rounded-full text-white flex items-center justify-center hover:opacity-90 hover:-translate-y-0.5 transition">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d={i.d} /></svg>
        </a>
      ))}
    </div>
  );
}
