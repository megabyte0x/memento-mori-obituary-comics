/**
 * Server-rendered FAQ block that renders a visible, crawlable question/answer
 * list. The semantic details/summary structure keeps the answers accessible to
 * readers, search engines, and answer engines without ineligible rich-result markup.
 *
 * @param {object} props
 * @param {string} props.heading Visible section heading (defaults to a question prompt).
 * @param {string} [props.id] Anchor id for the section heading.
 * @param {Array<{question: string, answer: string}>} props.items Q&A pairs. Answers are plain text.
 */
export function FaqSection({ heading = "Frequently Asked Questions", id = "faq", items = [] }) {
  const faqs = (items || []).filter((item) => item && item.question && item.answer);
  if (!faqs.length) return null;

  return (
    <section className="faq-section" aria-labelledby={id}>
      <div className="kicker">Questions &amp; answers</div>
      <h2 id={id}>{heading}</h2>
      <div className="faq-list">
        {faqs.map((item, index) => (
          <details className="faq-item" key={index} open={index === 0}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
