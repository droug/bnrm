import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Collection {
  id: string;
  title: string;
  icon: LucideIcon;
  count: string;
  description: string;
  color: string;
  bgColor: string;
  gradient: string;
}

interface CollectionsGridProps {
  collections: Collection[];
  onCollectionClick?: (id: string) => void;
}

export function CollectionsGrid({ collections, onCollectionClick }: CollectionsGridProps) {
  return (
    <section className="mb-12">
      <h2 className="text-4xl font-moroccan font-bold text-foreground mb-8 text-center">
        Explorer nos Collections
      </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => {
          const IconComponent = collection.icon;
          return (
            <Card
              key={collection.id}
              className="group overflow-hidden hover:shadow-moroccan transition-all duration-500 cursor-pointer bg-card/80 backdrop-blur border-2 border-gold/20 hover:border-gold/40"
              onClick={() => onCollectionClick?.(collection.id)}
            >
              <CardHeader className={`bg-gradient-to-br ${collection.gradient} relative`}>
                <div className="absolute inset-0 bg-pattern-moroccan-stars opacity-10"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div className={`p-4 rounded-xl ${collection.bgColor} backdrop-blur`}>
                    <IconComponent className={`h-8 w-8 ${collection.color}`} />
                  </div>
                  <span className={`text-3xl font-bold ${collection.color}`}>
                    {collection.count}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <CardTitle className="mb-2 text-xl group-hover:text-primary transition-colors">
                  {collection.title}
                </CardTitle>
                <CardDescription className="text-base">
                  {collection.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
