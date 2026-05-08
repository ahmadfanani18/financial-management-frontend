'use client';

import { motion } from 'framer-motion';
import { Shield, TrendingUp, Sparkles, Users } from 'lucide-react';

const stats = [
  { label: 'Pengguna Aktif', value: '10.000+' },
  { label: 'Transaksi Diproses', value: '1M+' },
  { label: 'Rating Pengguna', value: '4.9/5' },
  { label: 'Tahun Pengalaman', value: '3+' },
];

const values = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Keamanan Terdepan',
    description: 'Data Anda dilindungi dengan enkripsi tingkat tinggi dan standar keamanan industri.',
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: 'Pertumbuhan Keuangan',
    description: 'Kami membantu Anda mencapai tujuan keuangan dengan tools yang tepat.',
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: 'Inovasi AI',
    description: 'Gunakan kekuatan AI untuk insights keuangan yang lebih akurat.',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Komunitas Terpercaya',
    description: 'Bergabung dengan ribuan pengguna yang telah merasakan manfaat Finova.',
  },
];

export function About() {
  return (
    <section id="about" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Tentang Finova
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Platform manajemen keuangan pribadi yang membantu Anda mencatat, menganalisis, dan merencanakan keuangan dengan lebih baik.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center p-6 rounded-2xl bg-muted/30"
            >
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Mengapa Memilih Finova?
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-card border hover:shadow-lg transition-shadow"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                {value.icon}
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">{value.title}</h4>
              <p className="text-sm text-muted-foreground">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}