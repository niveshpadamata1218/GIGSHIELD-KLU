import { AnimatePresence, motion } from 'framer-motion'

function SlideOver({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: 440 }}
            animate={{ x: 0 }}
            exit={{ x: 440 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed right-0 top-0 z-50 h-full w-[440px] max-w-full overflow-y-auto bg-white shadow-2xl"
          >
            {children}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}

export default SlideOver
