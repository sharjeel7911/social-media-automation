// ============================================================================
// WHAT IS THIS FILE?
// A small stand-in for a "LinkedIn" icon. The icon library this project
// uses doesn't include an actual LinkedIn logo (brand logos are left out
// of most icon libraries since they're trademarked), so instead this
// draws a simple rounded square in LinkedIn's brand blue with the letters
// "in" in it — evokes the brand without reproducing their actual logo image.
// ============================================================================

export function LinkedInMark({ size = 18 }: { size?: number }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: size * 0.2,
        background: "#0A66C2",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.55,
        fontFamily: "-apple-system, 'Segoe UI', Roboto, sans-serif",
        flexShrink: 0,
      }}
    >
      in
    </span>
  );
}
