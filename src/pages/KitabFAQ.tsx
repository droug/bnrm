import { Link } from "react-router-dom";
import KitabHeader from "@/components/KitabHeader";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Mail, Send, MessageCircle, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function KitabFAQ() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Implement actual email sending
    toast.success("Votre message a été envoyé avec succès !");
    
    // Reset form
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      content: "kitab@bnrm.ma",
      description: "Pour suggestions et informations"
    },
    {
      icon: Phone,
      title: "Téléphone",
      content: "+212 (0)5 37 XX XX XX",
      description: "Du lundi au vendredi, 9h-17h"
    },
    {
      icon: MapPin,
      title: "Adresse",
      content: "Bibliothèque Nationale du Royaume du Maroc",
      description: "Avenue Allal El Fassi, Rabat"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <KitabHeader />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--kitab-accent))] via-[hsl(var(--kitab-secondary))] to-[hsl(var(--kitab-primary))] py-20">
        <div 
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'var(--pattern-kitab-books)' }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <Link to="/kitab">
            <Button variant="ghost" className="text-white hover:text-white/80 mb-6">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour au Portail Kitab
            </Button>
          </Link>
          
          <div className="max-w-4xl mx-auto text-center">
            <MessageCircle className="w-16 h-16 text-white mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Questions & Réponses
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Contactez-nous pour vos suggestions et informations
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <section>
            <Card className="border-0 shadow-[var(--shadow-kitab-strong)]">
              <CardHeader className="bg-gradient-to-r from-[hsl(var(--kitab-neutral-light))] to-white">
                <CardTitle className="text-2xl text-[hsl(var(--kitab-primary))]">
                  Envoyez-nous un Message
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nom complet *
                    </label>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Votre nom"
                      required
                      className="h-12 border-2 border-[hsl(var(--kitab-primary))]/30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre.email@exemple.com"
                      required
                      className="h-12 border-2 border-[hsl(var(--kitab-primary))]/30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Sujet *
                    </label>
                    <Input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Objet de votre message"
                      required
                      className="h-12 border-2 border-[hsl(var(--kitab-primary))]/30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Message *
                    </label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Décrivez votre demande, suggestion ou question..."
                      required
                      rows={6}
                      className="border-2 border-[hsl(var(--kitab-primary))]/30 resize-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-[hsl(var(--kitab-primary))] hover:bg-[hsl(var(--kitab-primary-dark))] text-white h-12"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Envoyer le Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>

          {/* Contact Information */}
          <section className="space-y-6">
            <Card className="border-0 shadow-[var(--shadow-kitab)]">
              <CardHeader>
                <CardTitle className="text-xl text-[hsl(var(--kitab-primary))]">
                  Informations de Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {contactInfo.map((info, index) => {
                  const IconComponent = info.icon;
                  return (
                    <div key={index} className="flex items-start gap-4">
                      <div className="bg-gradient-to-br from-[hsl(var(--kitab-primary))]/20 to-[hsl(var(--kitab-accent))]/10 p-3 rounded-lg">
                        <IconComponent className="w-6 h-6 text-[hsl(var(--kitab-primary))]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">
                          {info.title}
                        </h3>
                        <p className="text-[hsl(var(--kitab-primary))] font-medium mb-1">
                          {info.content}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {info.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-[var(--shadow-kitab)] bg-gradient-to-br from-[hsl(var(--kitab-primary))] to-[hsl(var(--kitab-secondary))] text-white">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-4">
                  Professionnels du Livre
                </h3>
                <p className="text-white/90 leading-relaxed mb-6">
                  Éditeurs, auteurs, écrivains marocains : vous souhaitez intégrer vos publications 
                  dans le projet Kitab ? Contactez-nous à l'adresse{" "}
                  <span className="font-semibold">kitab@bnrm.ma</span> avec :
                </p>
                <ul className="space-y-2 text-white/90">
                  <li className="flex items-start gap-2">
                    <span className="text-[hsl(var(--kitab-accent))] mt-1">•</span>
                    <span>Informations sur votre maison d'édition ou bibliographie</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[hsl(var(--kitab-accent))] mt-1">•</span>
                    <span>Liste des publications à référencer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[hsl(var(--kitab-accent))] mt-1">•</span>
                    <span>Métadonnées, couvertures et sommaires</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
