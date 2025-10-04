import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FileText, Calendar, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CBMOrganesGestion() {
  const bureauMembers = [
    { role: "Président", name: "Dr. Ahmed BENALI", institution: "Bibliothèque Nationale du Royaume du Maroc" },
    { role: "Vice-Président", name: "Pr. Fatima ZAHRA", institution: "Bibliothèque Universitaire Hassan II" },
    { role: "Secrétaire Général", name: "M. Karim IDRISSI", institution: "Bibliothèque Municipale de Casablanca" },
    { role: "Trésorier", name: "Mme. Leila AMRANI", institution: "Médiathèque de Rabat" }
  ];

  const comiteActif = [
    { domaine: "Catalogage", responsable: "Mme. Sarah TAZI", membres: 5 },
    { domaine: "Formation", responsable: "M. Omar BENJELLOUN", membres: 4 },
    { domaine: "Technique", responsable: "M. Youssef ALAOUI", membres: 6 },
    { domaine: "Communication", responsable: "Mme. Zineb MALKI", membres: 3 }
  ];

  const projetsEnCours = [
    { titre: "Migration UNIMARC", statut: "En cours", progression: 65 },
    { titre: "Formation catalogage RDA", statut: "Planifié", progression: 20 },
    { titre: "Extension réseau SRU", statut: "En cours", progression: 80 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-cbm-primary/5 to-cbm-secondary/5">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cbm-primary to-cbm-accent flex items-center justify-center shadow-cbm">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cbm-primary via-cbm-secondary to-cbm-accent bg-clip-text text-transparent">
                Organes de Gestion CBM
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Structure organisationnelle et instances de gouvernance
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="bureau" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 bg-cbm-primary/10">
            <TabsTrigger value="bureau" className="data-[state=active]:bg-cbm-primary data-[state=active]:text-white">
              Bureau CBM
            </TabsTrigger>
            <TabsTrigger value="comite" className="data-[state=active]:bg-cbm-secondary data-[state=active]:text-white">
              Comité Actif
            </TabsTrigger>
            <TabsTrigger value="projets" className="data-[state=active]:bg-cbm-accent data-[state=active]:text-white">
              Projets
            </TabsTrigger>
            <TabsTrigger value="rapports" className="data-[state=active]:bg-cbm-primary data-[state=active]:text-white">
              Rapports
            </TabsTrigger>
          </TabsList>

          {/* Bureau CBM */}
          <TabsContent value="bureau" className="space-y-6">
            <Card className="border-2 border-cbm-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl text-cbm-primary">Composition du Bureau</CardTitle>
                <CardDescription>Membres élus pour le mandat 2024-2026</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {bureauMembers.map((member, index) => (
                    <Card key={index} className="border border-cbm-primary/20 hover:shadow-cbm transition-all">
                      <CardHeader>
                        <CardTitle className="text-lg text-cbm-primary">{member.role}</CardTitle>
                        <CardDescription className="font-semibold text-foreground">{member.name}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{member.institution}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-cbm-secondary/20">
              <CardHeader>
                <CardTitle className="text-xl">Missions du Bureau</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="h-2 w-2 rounded-full bg-cbm-secondary mt-2" />
                    <span>Direction stratégique et pilotage du réseau CBM</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-2 w-2 rounded-full bg-cbm-secondary mt-2" />
                    <span>Validation des nouveaux membres et partenariats</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-2 w-2 rounded-full bg-cbm-secondary mt-2" />
                    <span>Supervision des projets et budget annuel</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-2 w-2 rounded-full bg-cbm-secondary mt-2" />
                    <span>Représentation du réseau auprès des instances nationales et internationales</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comité Actif */}
          <TabsContent value="comite" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {comiteActif.map((comite, index) => (
                <Card key={index} className="border-2 border-cbm-secondary/20 hover:shadow-cbm-strong transition-all">
                  <CardHeader>
                    <CardTitle className="text-xl text-cbm-secondary">Comité {comite.domaine}</CardTitle>
                    <CardDescription>Responsable: {comite.responsable}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Membres actifs</span>
                      <span className="text-2xl font-bold text-cbm-secondary">{comite.membres}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Projets */}
          <TabsContent value="projets" className="space-y-6">
            <Card className="border-2 border-cbm-accent/20">
              <CardHeader>
                <CardTitle className="text-2xl text-cbm-accent">Projets en Cours</CardTitle>
                <CardDescription>État d'avancement des initiatives 2024</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {projetsEnCours.map((projet, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{projet.titre}</h3>
                          <p className="text-sm text-muted-foreground">{projet.statut}</p>
                        </div>
                        <span className="text-2xl font-bold text-cbm-accent">{projet.progression}%</span>
                      </div>
                      <div className="w-full h-2 bg-cbm-accent/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cbm-accent to-cbm-secondary transition-all"
                          style={{ width: `${projet.progression}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rapports */}
          <TabsContent value="rapports" className="space-y-6">
            <Card className="border-2 border-cbm-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl text-cbm-primary">Rapports Annuels</CardTitle>
                <CardDescription>Documents officiels et bilans d'activité</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[2023, 2022, 2021].map((year) => (
                    <div key={year} className="flex items-center justify-between p-4 border rounded-lg hover:bg-cbm-primary/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-cbm-primary" />
                        <div>
                          <h3 className="font-semibold">Rapport d'Activité {year}</h3>
                          <p className="text-sm text-muted-foreground">Bilan complet et statistiques</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Télécharger
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-cbm-secondary/20">
              <CardHeader>
                <CardTitle className="text-xl text-cbm-secondary">
                  <Upload className="h-5 w-5 inline mr-2" />
                  Mise à Jour des Documents
                </CardTitle>
                <CardDescription>Espace réservé aux membres du Bureau et Comité Actif</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Cette section permet aux membres autorisés de publier les nouveaux rapports, comptes-rendus de réunions et documents officiels.
                </p>
                <Button className="bg-cbm-secondary hover:bg-cbm-secondary/90">
                  Accéder à l'espace de gestion
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}
