/** Customer-facing copy — keep tone direct and specific, like a real store. */

export const homeCopy = {
  eyebrow: "Pearl jewelry",
  headline: "Fine pearls, shipped anywhere",
  subhead:
    "Necklaces, earrings, bracelets, and rings. All prices in USD. We ship to most countries.",
  faqs: [
    {
      question: "Do you ship to my country?",
      answer:
        "Yes. Standard and Express options appear at checkout. Rates depend on the method you choose.",
    },
    {
      question: "Which cards do you accept?",
      answer:
        "Visa, Mastercard, and other major cards through our payment partner, plus PayPal. PayPal is charged in USD. Card payments use a live USD→IDR rate at checkout (shown before you pay).",
    },
    {
      question: "Are duties and tax included?",
      answer:
        "No. Import duties, VAT, or local taxes may apply when your package arrives. Those are paid to your carrier or customs office, not to us.",
    },
    {
      question: "When will I get tracking?",
      answer:
        "We email tracking as soon as the order leaves our warehouse. You can also check status under Account → Orders if you signed in.",
    },
  ],
  testimonials: [
    {
      quote:
        "The strand matched the photos. Arrived in about two weeks to Shanghai, well packed.",
      author: "Mei L.",
      location: "Shanghai",
    },
    {
      quote:
        "Ordered the stud earrings for my wife. Checkout was straightforward and the price was clear upfront.",
      author: "James T.",
      location: "Singapore",
    },
  ],
  featured: {
    title: "Featured",
    description: "Pieces we are highlighting this season.",
  },
  bestSellers: {
    title: "Popular right now",
    description: "What other customers are buying.",
  },
} as const;

export const checkoutCopy = {
  informationLead: "Enter your email for the receipt and order updates.",
  secureBadge: "Encrypted checkout",
  processingTitle: "Pay for your order",
  processingCardNote:
    "Your card is charged in IDR using the live rate shown below. Your order total stays in USD.",
  processingPayPalNote: "You will be redirected to PayPal to complete payment in USD.",
  openingPayment: "Opening payment…",
  redirectingPayPal: "Redirecting to PayPal…",
} as const;
