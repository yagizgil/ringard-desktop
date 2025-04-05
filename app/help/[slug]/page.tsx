'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ThumbsUp, ThumbsDown } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

const helpTopics = [
  {
    slug: 'reklam-nasil-calisir',
    title: 'Ringard’da Reklamlar Nasıl Çalışır?',
    description: 'Reklam algoritması, gelir paylaşımı ve kullanıcı deneyimi hakkında bilgilendirme.',
    date: '2 Nisan 2025',
    category: 'Reklam'
  },
  {
    slug: 'sunucu-nasil-acilir',
    title: 'Sunucu Nasıl Açılır?',
    description: 'Kendi Ringard sunucunuzu oluşturmak için bilmeniz gereken her şey.',
    date: '1 Nisan 2025',
    category: 'Sunucu'
  },
  {
    slug: 'yayinci-rozeti-almak',
    title: 'Yayıncı Rozeti Nasıl Alınır?',
    description: 'Yayıncı rozeti alacakların karşılaması gereken koşullar.',
    date: '29 Mart 2025',
    category: 'Rozet'
  }
  ,
  {
    slug: 'basarimlar-nedir-nasil-alinir',
    title: 'Başarımlar nedir ve nasıl alınır?',
    description: 'Profil bölümündeki başarımlar kısmı hakkında bilgilendirme.',
    date: '29 Mart 2025',
    category: 'Başarımlar'
  }
];

export default function HelpDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [content, setContent] = useState('');

  const topic = helpTopics.find((t) => t.slug === slug);

  useEffect(() => {
    if (!slug) return;
    fetch(`/help/content/${slug}.md`)
      .then((res) => res.text())
      .then((data) => setContent(data))
      .catch(() => setContent('İçerik yüklenemedi.'));
  }, [slug]);

  if (!topic) return <div className="p-6">Bu konu bulunamadı.</div>;

  return (
    <div className="min-h-screen bg-white text-orange-900">
      {/* Hero */}
      <div className="bg-gradient-to-tr from-orange-500 to-orange-600 py-16 px-6 text-center border-b border-orange-200 rounded-b-3xl">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-start mb-4">
            <button onClick={() => router.back()} className="flex items-center gap-1 text-white text-sm hover:underline">
              <ChevronLeft className="w-4 h-4" /> Geri
            </button>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{topic.title}</h1>
          <p className="text-orange-100 mb-2">{topic.description}</p>
          <div className="text-xs text-orange-200 flex items-center justify-center gap-4">
            <span>{topic.category}</span>
            <span>{topic.date}</span>
            <button className="underline underline-offset-2 hover:text-white">Paylaş</button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* İçerik */}
        <article className="prose prose-orange max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>

          {/* Yararlı mı kısmı */}
          <div className="mt-12 border-t border-gray-200 pt-6 text-center">
            <p className="text-sm text-gray-600 mb-3">Bu sayfanın içeriği yararlı oldu mu?</p>
            <div className="flex justify-center gap-6">
              <button className="flex flex-col items-center text-green-600 hover:text-green-700">
                <ThumbsUp className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Evet</span>
              </button>
              <button className="flex flex-col items-center text-gray-500 hover:text-gray-700">
                <ThumbsDown className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Hayır</span>
              </button>
            </div>
          </div>
        </article>
      </div>

      {/* Önceki / Sonraki */}
      <div className="max-w-6xl mx-auto px-6 pb-16 flex flex-col sm:flex-row justify-between items-center text-sm text-orange-600 border-t border-orange-100 pt-6 gap-4">
        <Link href={`/help/${getPrevSlug(slug as string)}`} className="hover:underline flex items-center gap-1">
          ← <span className="font-medium">Önceki</span>
        </Link>
        <Link href={`/help/${getNextSlug(slug as string)}`} className="hover:underline flex items-center gap-1">
          <span className="font-medium">Sonraki</span> →
        </Link>
      </div>
    </div>
  );
}

function getPrevSlug(currentSlug: string) {
  const index = helpTopics.findIndex((t) => t.slug === currentSlug);
  return helpTopics[index - 1]?.slug || helpTopics[0].slug;
}

function getNextSlug(currentSlug: string) {
  const index = helpTopics.findIndex((t) => t.slug === currentSlug);
  return helpTopics[index + 1]?.slug || helpTopics[helpTopics.length - 1].slug;
}
