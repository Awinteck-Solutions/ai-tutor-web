const TutorAvatar = ({ thinking = false }) => (
  <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
    {thinking && (
      <>
        <span className="absolute inset-0 animate-ping rounded-xl bg-primary/20" />
        <span className="absolute -inset-1 animate-chat-orbit rounded-2xl border border-primary/25" />
      </>
    )}
    <div
      className={`relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 via-primary/15 to-secondary/10 text-primary shadow-glow-sm ${
        thinking ? 'animate-chat-glow' : ''
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" aria-hidden>
        <path
          d="M12 3c3.2 0 5.8 2.4 6 5.5.2 2.6-1.2 4.9-3.4 5.9l-.6 2.6a1 1 0 0 1-1.9-.4l.2-1.2c-2.2-.8-3.8-2.9-3.8-5.4C8.5 5.8 10 3 12 3Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 14.5c.8 1.2 2.2 2 3.7 2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="10" cy="8.5" r="0.75" fill="currentColor" />
        <circle cx="14" cy="8.5" r="0.75" fill="currentColor" />
      </svg>
    </div>
  </div>
);

const WaveBars = () => (
  <svg viewBox="0 0 36 16" className="h-4 w-9 text-primary/70" aria-hidden>
    {[0, 1, 2, 3, 4].map((i) => (
      <rect
        key={i}
        x={i * 7 + 1}
        y="4"
        width="3"
        rx="1.5"
        height="8"
        fill="currentColor"
        className="animate-chat-wave origin-bottom"
        style={{ animationDelay: `${i * 120}ms` }}
      />
    ))}
  </svg>
);

export const ChatThinkingIndicator = ({ onStop }) => (
  <li className="flex gap-3 animate-content-fade-in">
    <TutorAvatar thinking />
    <div className="relative max-w-[92%] overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-muted/70 via-card/80 to-muted/50 px-4 py-3.5 shadow-sm sm:max-w-[85%]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,hsl(var(--primary)/0.08)_50%,transparent_75%)] bg-[length:200%_100%] animate-shimmer-slide" />
      <div className="relative flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2.5">
          <WaveBars />
          <span className="text-sm font-medium text-foreground">Thinking</span>
          <span className="inline-flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1 w-1 rounded-full bg-primary/70 animate-bounce"
                style={{ animationDelay: `${i * 140}ms` }}
              />
            ))}
          </span>
        </div>
        {onStop && (
          <button
            type="button"
            onClick={onStop}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/80 px-2.5 py-1 text-xs font-medium text-muted-foreground transition hover:border-primary/35 hover:bg-primary/5 hover:text-primary"
          >
            <svg viewBox="0 0 16 16" className="h-3 w-3 fill-current" aria-hidden>
              <rect x="3" y="3" width="10" height="10" rx="1.5" />
            </svg>
            Stop
          </button>
        )}
      </div>
      <p className="relative mt-1.5 text-xs text-muted-foreground">
        Grounding in your lesson materials…
      </p>
    </div>
  </li>
);

export const ChatAssistantAvatar = () => <TutorAvatar />;

export default ChatThinkingIndicator;
