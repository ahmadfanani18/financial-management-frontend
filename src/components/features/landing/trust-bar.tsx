'use client';

import { motion } from 'framer-motion';
import { Shield, RefreshCw, Headphones, Lock } from 'lucide-react';

const trustItems = [
  {
    icon: Shield,
    title: 'Bank-Level Security',
    description: '256-bit encryption',
  },
  {
    icon: RefreshCw,
    title: 'Automatic Sync',
    description: 'Real-time bank sync',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Real humans, real help',
  },
  {
    icon: Lock,
    title: 'Privacy First',
    description: 'Your data stays yours',
  },
];

export function TrustBar() {
  return (
    <section className="py-6 bg-muted/30 border-y">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-foreground text-sm">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.description}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
