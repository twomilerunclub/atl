/** The black page header used by every inner page. Markup unchanged. */
export default function Band({
  eyebrow,
  title,
  sub,
  children,
}: {
  eyebrow?: React.ReactNode;
  title: string;
  sub?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="band">
      {eyebrow ? <div className="eyebrow on-dark">{eyebrow}</div> : null}
      <h1>{title}</h1>
      {sub ? <p className="sub">{sub}</p> : null}
      {children ? <div className="pills">{children}</div> : null}
    </div>
  );
}
