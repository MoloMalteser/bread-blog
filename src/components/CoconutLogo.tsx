import React from 'react';
import { motion } from 'framer-motion';

const CoconutLogo = ({ className = "" }: { className?: string }) => {
  return (
    <motion.div
      className={`relative inline-flex items-center gap-2.5 cursor-pointer select-none ${className}`}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <motion.div
        className="text-2xl"
        animate={{ rotate: [0, -8, 8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        🥥
      </motion.div>
      <span className="text-xl font-semibold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
        coconut
      </span>
    </motion.div>
  );
};

export default CoconutLogo;
