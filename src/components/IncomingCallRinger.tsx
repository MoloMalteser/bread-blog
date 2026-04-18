import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIncomingCalls } from '@/hooks/useIncomingCalls';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';

const IncomingCallRinger = () => {
  const { incoming, accept, decline } = useIncomingCalls();
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <AnimatePresence>
      {incoming && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-[92vw] max-w-md"
        >
          <div className="glass-card p-4 rounded-3xl border border-primary/30 shadow-2xl flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-white text-xl"
            >
              📞
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Incoming call</p>
              <p className="font-semibold truncate">{incoming.caller_name}</p>
            </div>
            <Button
              size="icon"
              variant="destructive"
              className="rounded-full h-10 w-10"
              onClick={() => decline(incoming.id)}
            >
              <PhoneOff className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              className="rounded-full h-10 w-10 bg-green-500 hover:bg-green-600"
              onClick={async () => {
                await accept(incoming.id);
                navigate(`/${language}/contacts`);
              }}
            >
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IncomingCallRinger;
