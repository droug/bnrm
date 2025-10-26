import { Helmet } from "react-helmet";

interface NoticeHeadProps {
  title: string;
  author: string;
  summary?: string;
  keywords?: string[];
  isbn?: string;
}

export default function NoticeHead({ title, author, summary, keywords, isbn }: NoticeHeadProps) {
  const description = summary 
    ? summary.substring(0, 160) 
    : `Notice détaillée de l'ouvrage "${title}" par ${author}`;

  const keywordsMeta = keywords?.join(", ") || `${title}, ${author}, bibliothèque, catalogue`;

  return (
    <Helmet>
      <title>{`${title} - ${author} | Catalogue CBN - BNRM`}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywordsMeta} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="book" />
      <meta property="og:title" content={`${title} - ${author}`} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content="Catalogue des Bibliothèques Nationales - BNRM" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={`${title} - ${author}`} />
      <meta name="twitter:description" content={description} />
      
      {/* Book-specific meta tags */}
      <meta property="book:author" content={author} />
      {isbn && <meta property="book:isbn" content={isbn} />}
      
      {/* Schema.org markup for Google */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Book",
          "name": title,
          "author": {
            "@type": "Person",
            "name": author
          },
          "description": description,
          ...(isbn && { "isbn": isbn }),
          "inLanguage": "fr"
        })}
      </script>
    </Helmet>
  );
}
