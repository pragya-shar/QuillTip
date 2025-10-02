'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export default function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "What is QuillTip and what problem does it solve?",
      answer: "QuillTip lets writers earn money directly from readers without ads, subscriptions, or gatekeepers taking large cuts. Anyone can publish articles for free, readers tip writers instantly with cryptocurrency, and writers keep 97.5% of every tip. All payments happen through Stellar blockchain smart contracts in 3-5 seconds with no intermediaries. Writers own their content permanently through NFTs (digital certificates of ownership), and readers never pay to access articles - tipping is always voluntary."
    },
    {
      question: "How does the tipping mechanism work?",
      answer: "Readers connect a Stellar wallet (Freighter, xBull, Albedo, or hot wallet), browse articles, and click \"Tip\" to send XLM directly to the writer's wallet. The transaction completes in 3-5 seconds through Soroban smart contracts. Writers receive funds instantly in their wallet - no withdrawal process or waiting period. Minimum tip is 0.026 XLM (approximately $0.01 USD) to ensure transaction fees don't exceed the tip value. There's no maximum limit."
    },
    {
      question: "What's QuillTip's business model and revenue split?",
      answer: "Writers keep 97.5% of all tips. QuillTip takes 2.5% to cover infrastructure costs (hosting, Arweave storage fees, platform development). There are no subscription fees, hosting costs, or hidden charges for writers or readers."
    },
    {
      question: "Is QuillTip live on mainnet or testnet? When can I use it with real money?",
      answer: "Currently deployed on Stellar testnet for testing and development. Mainnet launch is scheduled for December 2025 after completing a third-party security audit and delivering SCF Build Award milestones. Public beta on testnet begins October 2025. You can test all features now with testnet XLM, but real-money transactions start in December 2025."
    },
    {
      question: "What does it cost to use QuillTip as a writer or reader?",
      answer: "Reading articles: completely free, no wallet needed. Tipping writers: pay only the Stellar network fee (0.05 XLM, less than $0.01) plus your chosen tip amount. Publishing articles: free, no hosting fees or subscriptions. Minting article NFTs: requires reaching a tip threshold (currently 10 XLM in total tips received), then pay minimal Stellar network fee for minting (approximately 0.05 XLM). Editing published articles: free, unlimited edits. When you update an article that's been minted as an NFT, the blockchain preserves the original version while displaying your latest edits to readers."
    },
    {
      question: "What barriers prevent mainstream users from adopting QuillTip?",
      answer: "Currently requires a Stellar wallet to tip or publish, which can intimidate non-crypto users. We're addressing this by: (1) Supporting four popular wallets through Stellar Wallet Kit for maximum compatibility, (2) Providing wallet setup guides and testnet XLM for new users, (3) Making all articles readable without any wallet, (4) Planning USDC support so users can tip with stablecoins instead of volatile XLM. Future roadmap includes social login options and custodial wallet integration."
    },
    {
      question: "How does QuillTip ensure my content survives long-term, even if the platform shuts down?",
      answer: "Two-layer permanence: (1) Arweave integration (launching October 2025) stores articles on decentralized, permanent storage that exists independently of QuillTip, with no recurring storage fees. (2) Article NFTs minted on Stellar blockchain create immutable proof of ownership and authorship. If QuillTip disappears, content persists on Arweave and ownership rights exist on Stellar."
    },
    {
      question: "How does QuillTip handle content moderation while remaining decentralized?",
      answer: "QuillTip removes illegal content and violations of community guidelines from the platform interface. However, once Arweave integration launches, articles are stored on a decentralized network beyond our control, meaning censorship-resistant copies may persist. This balances platform safety with writer freedom: we curate the QuillTip experience while writers retain true ownership. Think of it like a library removing a book from shelves while the book itself still exists elsewhere."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-32 px-8 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-neutral-100/30 to-transparent rounded-full filter blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tr from-neutral-100/40 to-transparent rounded-full filter blur-3xl" />

      <div className="container mx-auto max-w-4xl relative z-10" ref={ref}>
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100/80 backdrop-blur-sm rounded-full border border-neutral-200/60 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <HelpCircle className="w-4 h-4 text-neutral-700" />
            <span className="text-sm font-medium text-neutral-700 tracking-wide">
              FREQUENTLY ASKED QUESTIONS
            </span>
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-tight">
            <span className="text-neutral-900">
              FAQs
            </span>
          </h2>
          <p className="text-base text-neutral-700 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about QuillTip
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl border border-neutral-200/60 overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-neutral-50/50 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-neutral-900 pr-8">
                  {faq.question}
                </h3>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-neutral-600" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-8 pb-6 text-neutral-700 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
