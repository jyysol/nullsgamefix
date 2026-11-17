import { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReferenceModalProps {
  open: boolean;
  onClose: () => void;
}

interface ReferenceItem {
  src: string;
  title: string;
  caption: string;
}

const REFERENCES: ReferenceItem[] = [
  {
    src: '/assets/aistudio/Screenshot_2026-11-17_at_22.07.26_3a275e21.png',
    title: 'Adegan Karakter di Kereta Senja',
    caption: 'Karakter berambut tiga duri dengan headphone merah, kaus krem, celana biru, dan konsol merah di kereta senja.',
  },
  {
    src: '/assets/aistudio/HWTAGCDa0AAF0O7_81973f8f.jpeg',
    title: 'Koleksi Hardware Transparan NULLS',
    caption: 'Inspirasi cangkang merah transparan dengan PCB hijau, chip NULLS USG-003, dan estetika konsol era 90-an.',
  },
  {
    src: '/assets/aistudio/Screenshot_2026-11-17_at_17.07.58_ca1603b2.png',
    title: 'Layar Boot Logo NULLS',
    caption: 'Logo neon biru elektrik bergaris putih di layar CRT saat konsol pertama kali menyala.',
  },
];

function ReferenceCard({ item }: { item: ReferenceItem }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-[#15141b] border border-white/10 p-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-[#0c0b10]">
        {!hasError ? (
          <img
            src={item.src}
            alt={item.title}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#191622] to-[#0c0b10] p-4 text-center">
            <ImageIcon className="h-7 w-7 text-white/40" />
            <span className="text-xs font-medium text-white/60">{item.title}</span>
          </div>
        )}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-[#f5efe6]">{item.title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-[#b2aba0]">{item.caption}</p>
      </div>
    </div>
  );
}

export function ReferenceModal({ open, onClose }: ReferenceModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 sm:p-6"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Referensi Visual"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl rounded-2xl bg-[#100f15] border border-white/12 p-5 sm:p-6 shadow-2xl max-h-[88vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-[#f5efe6]">
                  Referensi Visual NULLS
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-[#a69f94]">
                  Tiga gambar referensi utama yang diterjemahkan ke dalam animasi karakter, cangkang konsol, dan layar boot.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup referensi"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[#d7d0c5] hover:bg-white/10 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              {REFERENCES.map((item) => (
                <ReferenceCard key={item.src} item={item} />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
