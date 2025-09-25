import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="pt-28 pb-16 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-6xl font-bold gradient-text"
      >
        Building sleek products with React & FastAPI
      </motion.h1>
      <p className="mt-4 text-zinc-400 max-w-2xl mx-auto">
        I’m Kaushalednra Singh — a full‑stack developer focused on shipping fast, beautiful, and reliable experiences.
      </p>
      <div className="mt-6 flex gap-3 justify-center">
        <a href="#projects" className="px-4 py-2 rounded-2xl bg-brand hover:shadow-glow">View Projects</a>
        <a href="#resume" className="px-4 py-2 rounded-2xl border border-zinc-700 hover:bg-zinc-800">My Resume</a>
      </div>
    </section>
  )
}
