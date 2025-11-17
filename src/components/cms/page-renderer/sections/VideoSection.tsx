interface VideoSectionProps {
  section: any;
  language: 'fr' | 'ar';
}

export function VideoSection({ section, language }: VideoSectionProps) {
  const title = language === 'ar' ? section.title_ar || section.title_fr : section.title_fr;
  const content = language === 'ar' ? section.content_ar || section.content_fr : section.content_fr;
  const { videoUrl, videoType = 'youtube', aspectRatio = '16:9' } = section.props || {};

  const aspectClass = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square'
  }[aspectRatio] || 'aspect-video';

  const getEmbedUrl = () => {
    if (!videoUrl) return '';
    
    if (videoType === 'youtube') {
      const videoId = videoUrl.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&\n?#]+)/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : videoUrl;
    }
    
    return videoUrl;
  };

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4 max-w-4xl">
        {title && <h2 className="text-3xl font-bold mb-6 text-center">{title}</h2>}
        <div className={`w-full ${aspectClass} rounded-lg overflow-hidden shadow-lg`}>
          <iframe
            src={getEmbedUrl()}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {content && <p className="mt-4 text-center text-muted-foreground">{content}</p>}
      </div>
    </section>
  );
}
