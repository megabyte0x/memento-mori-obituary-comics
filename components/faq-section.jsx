import { absoluteUrl } from "@/lib/site";

/**
 * Server-rendered FAQ block that renders a visible, crawlable question/answer
 * list and emits matching FAQPage JSON-LD. The visible copy and the structured
 * data are generated from the same source so they never drift apart, which is a
 * requirement for FAQ structured data and improves passage-level citability in
 * AI Overviews, ChatGPT search, and Perplexity.
 *
 * @param {object} props
 * @param {string} props.heading Visible section heading (defaults to a question prompt).
 * @param {string} [props.id] Anchor id for the section heading.
 * @param {string} [props.path] Page path used to scope the FAQPage @id.
 * @param {Array<{question: string, answer: string}>} props.items Q&A pairs. Answers are plain text.
 */
export function FaqSection({ heading = "Frequently Asked Questions", id = "faq", path = "/", items = [] }) {
  const faqs = (items || []).filter((item) => item && item.question && item.answer);
  if (!faqs.length) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${absoluteUrl(path)}#faq`,
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section className="faq-section" aria-labelledby={id}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
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
