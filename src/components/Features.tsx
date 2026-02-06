
import React from 'react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: '💬',
    title: 'Social Feed',
    description: 'A beautiful, infinite scroll feed with reactions, comments, and real-time updates.'
  },
  {
    icon: '🫧',
    title: 'Glassy Design',
    description: 'Every surface is translucent and alive — frosted glass, soft shadows, fluid motion.'
  },
  {
    icon: '🌊',
    title: 'Fluid Interactions',
    description: 'Draggable tab bar, spring physics, and buttery smooth 60fps animations everywhere.'
  },
  {
    icon: '🌓',
    title: 'Adaptive Themes',
    description: 'Automatic dark & light mode with aqua-tinted glass that adjusts to your environment.'
  },
  {
    icon: '📱',
    title: 'Mobile First',
    description: 'Designed for your thumb. PWA-ready, installable, and feels native on every device.'
  },
  {
    icon: '🆓',
    title: 'Open & Free',
    description: 'No paywalls, no algorithmic feeds. Just your people, your posts, your feed.'
  }
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
};

const Features = () => {
  return (
    <section id="features" className="py-24 px-4 relative">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-semibold mb-4 tracking-tight">
            Built different.
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            No noise. No clutter. Just a beautiful social experience.
          </p>
        </motion.div>
        
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              className="group glass-card p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-base font-semibold mb-1.5">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
