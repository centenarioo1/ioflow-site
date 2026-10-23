import React from 'react';
import type { Metadata } from 'next';
import BlogClientView from './BlogClientView';
import WhatsAppButton from '../../components/WhatsAppButton';

export const metadata: Metadata = {
  title: 'Blog & Dicas de Cultivo | BIOFLOW',
  description: 'Guias práticos de cultivo orgânico e mineral.',
};

export default function BlogPage() {
  return (
    <>
      <BlogClientView />
      <WhatsAppButton />
    </>
  );
}