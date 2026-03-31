import { AnimatePresence, motion } from 'framer-motion'
import Button from './Button'

function ConfirmModal({ isOpen, onClose, onConfirm, title, description }) {
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
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed left-1/2 top-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h3 className="text-lg font-semibold text-gs-text">{title}</h3>
            <p className="mt-2 text-sm text-gs-muted">{description}</p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={onClose} className="px-4 py-2 text-sm">
                Cancel
              </Button>
              <Button variant="danger" onClick={onConfirm} className="px-4 py-2 text-sm">
                End session
              </Button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}

export default ConfirmModal
