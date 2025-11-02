import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { documentType, request } = await req.json();

    // Générer le HTML du document
    const htmlContent = generateDocumentHTML(documentType, request);

    // Utiliser un service externe pour convertir HTML en PDF avec support arabe
    const response = await fetch('https://api.html2pdf.app/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: htmlContent,
        engine: 'chrome',
        pdf: {
          format: 'A4',
          printBackground: true,
          margin: {
            top: '20mm',
            right: '15mm',
            bottom: '20mm',
            left: '15mm'
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }

    const pdfBuffer = await response.arrayBuffer();

    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${documentType}_${request.request_number}.pdf"`
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

function generateDocumentHTML(documentType: string, request: any): string {
  const baseStyle = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Roboto:wght@400;700&display=swap');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Roboto', sans-serif;
        direction: ltr;
        padding: 40px;
        color: #333;
      }
      
      .arabic {
        font-family: 'Amiri', serif;
        direction: rtl;
        text-align: right;
        line-height: 1.8;
      }
      
      .header {
        text-align: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 3px solid #2980b9;
      }
      
      .header h1 {
        color: #2980b9;
        font-size: 24px;
        margin-bottom: 10px;
      }
      
      .logo {
        font-size: 18px;
        color: #555;
        font-weight: bold;
      }
      
      .info-table {
        width: 100%;
        margin: 20px 0;
        border-collapse: collapse;
      }
      
      .info-table th,
      .info-table td {
        padding: 12px;
        border: 1px solid #ddd;
        text-align: left;
      }
      
      .info-table th {
        background-color: #2980b9;
        color: white;
        font-weight: bold;
      }
      
      .section {
        margin: 25px 0;
      }
      
      .section-title {
        font-size: 16px;
        font-weight: bold;
        color: #2980b9;
        margin-bottom: 10px;
        padding-bottom: 5px;
        border-bottom: 2px solid #2980b9;
      }
      
      .content-box {
        background-color: #f9f9f9;
        padding: 15px;
        border-radius: 5px;
        border-left: 4px solid #2980b9;
      }
      
      .footer {
        margin-top: 50px;
        padding-top: 20px;
        border-top: 1px solid #ddd;
        text-align: center;
        color: #666;
        font-size: 12px;
      }
      
      .signature {
        margin-top: 40px;
        text-align: right;
      }
    </style>
  `;

  switch (documentType) {
    case 'authorization':
      return `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          ${baseStyle}
        </head>
        <body>
          <div class="header">
            <div class="logo">المكتبة الوطنية للمملكة المغربية</div>
            <div class="logo">Bibliothèque Nationale du Royaume du Maroc</div>
            <h1>LETTRE D'AUTORISATION DE RESTAURATION</h1>
          </div>
          
          <div class="section">
            <p><strong>N° de demande:</strong> ${request.request_number}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          
          <div class="section">
            <div class="section-title">Objet: Autorisation de restauration</div>
            <p>La Bibliothèque Nationale du Royaume du Maroc autorise par la présente la restauration du manuscrit suivant:</p>
          </div>
          
          <table class="info-table">
            <tr>
              <th>Champ</th>
              <th>Information</th>
            </tr>
            <tr>
              <td>Titre</td>
              <td class="arabic">${request.manuscript_title}</td>
            </tr>
            <tr>
              <td>Cote</td>
              <td>${request.manuscript_cote}</td>
            </tr>
            <tr>
              <td>Description des dommages</td>
              <td class="arabic">${request.damage_description}</td>
            </tr>
            <tr>
              <td>Niveau d'urgence</td>
              <td>${request.urgency_level}</td>
            </tr>
            <tr>
              <td>Durée estimée</td>
              <td>${request.estimated_duration_days ? request.estimated_duration_days + ' jours' : 'À déterminer'}</td>
            </tr>
            <tr>
              <td>Coût estimé</td>
              <td>${request.estimated_cost ? request.estimated_cost.toLocaleString('fr-FR') + ' DH' : 'À déterminer'}</td>
            </tr>
          </table>
          
          ${request.director_notes ? `
            <div class="section">
              <div class="section-title">Notes de la direction</div>
              <div class="content-box">${request.director_notes}</div>
            </div>
          ` : ''}
          
          <div class="signature">
            <p><strong>Le Directeur</strong></p>
            <p>Bibliothèque Nationale du Royaume du Maroc</p>
          </div>
          
          <div class="footer">
            Page 1 - Document généré le ${new Date().toLocaleDateString('fr-FR')}
          </div>
        </body>
        </html>
      `;

    case 'reception':
      return `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          ${baseStyle}
        </head>
        <body>
          <div class="header">
            <div class="logo">المكتبة الوطنية للمملكة المغربية</div>
            <div class="logo">Bibliothèque Nationale du Royaume du Maroc</div>
            <h1>PROCÈS-VERBAL DE RÉCEPTION D'ŒUVRE</h1>
          </div>
          
          <div class="section">
            <p>Je soussigné(e), représentant de la Bibliothèque Nationale du Royaume du Maroc, certifie avoir reçu ce jour le manuscrit suivant pour restauration:</p>
          </div>
          
          <table class="info-table">
            <tr>
              <th>Champ</th>
              <th>Information</th>
            </tr>
            <tr>
              <td>N° de demande</td>
              <td>${request.request_number}</td>
            </tr>
            <tr>
              <td>Titre du manuscrit</td>
              <td class="arabic">${request.manuscript_title}</td>
            </tr>
            <tr>
              <td>Cote</td>
              <td>${request.manuscript_cote}</td>
            </tr>
            <tr>
              <td>Date de réception</td>
              <td>${new Date().toLocaleDateString('fr-FR')}</td>
            </tr>
            <tr>
              <td>État lors de la réception</td>
              <td class="arabic">${request.damage_description}</td>
            </tr>
          </table>
          
          <div class="signature">
            <p><strong>Signature du responsable:</strong></p>
            <p style="margin-top: 60px;">Date: ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          
          <div class="footer">
            Page 1 - Document généré le ${new Date().toLocaleDateString('fr-FR')}
          </div>
        </body>
        </html>
      `;

    case 'diagnosis':
      return `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          ${baseStyle}
        </head>
        <body>
          <div class="header">
            <div class="logo">المكتبة الوطنية للمملكة المغربية</div>
            <div class="logo">Bibliothèque Nationale du Royaume du Maroc</div>
            <h1>RAPPORT DE DIAGNOSTIC</h1>
          </div>
          
          <div class="section">
            <p><strong>N° de demande:</strong> ${request.request_number}</p>
            <p><strong>Manuscrit:</strong> <span class="arabic">${request.manuscript_title}</span></p>
            <p><strong>Cote:</strong> ${request.manuscript_cote}</p>
            <p><strong>Date du diagnostic:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          
          <div class="section">
            <div class="section-title">ÉVALUATION DES DOMMAGES</div>
            <div class="content-box arabic">
              ${request.diagnosis_report || request.damage_description}
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">RECOMMANDATIONS</div>
            <div class="content-box">
              <p><strong>Niveau d'urgence:</strong> ${request.urgency_level}</p>
              <p><strong>Durée estimée:</strong> ${request.estimated_duration_days || 'À déterminer'} jours</p>
              <p><strong>Coût estimé:</strong> ${request.estimated_cost ? request.estimated_cost.toLocaleString('fr-FR') + ' DH' : 'À déterminer'}</p>
            </div>
          </div>
          
          <div class="footer">
            Page 1 - Document généré le ${new Date().toLocaleDateString('fr-FR')}
          </div>
        </body>
        </html>
      `;

    case 'quote':
      return `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          ${baseStyle}
        </head>
        <body>
          <div class="header">
            <div class="logo">المكتبة الوطنية للمملكة المغربية</div>
            <div class="logo">Bibliothèque Nationale du Royaume du Maroc</div>
            <h1>DEVIS DE RESTAURATION</h1>
          </div>
          
          <div class="section">
            <p><strong>N° de demande:</strong> ${request.request_number}</p>
            <p><strong>Date d'émission:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
            <p><strong>Validité:</strong> 30 jours</p>
          </div>
          
          <table class="info-table">
            <tr>
              <th>Description</th>
              <th>Montant</th>
            </tr>
            <tr>
              <td>Restauration du manuscrit: <span class="arabic">${request.manuscript_title}</span></td>
              <td>${request.quote_amount?.toLocaleString('fr-FR')} DH</td>
            </tr>
            <tr style="background-color: #2980b9; color: white; font-weight: bold;">
              <td>TOTAL</td>
              <td>${request.quote_amount?.toLocaleString('fr-FR')} DH</td>
            </tr>
          </table>
          
          ${request.quote_details ? `
            <div class="section">
              <div class="section-title">Détails</div>
              <div class="content-box arabic">${request.quote_details}</div>
            </div>
          ` : ''}
          
          <div class="footer">
            Page 1 - Document généré le ${new Date().toLocaleDateString('fr-FR')}
          </div>
        </body>
        </html>
      `;

    case 'completion':
      return `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          ${baseStyle}
        </head>
        <body>
          <div class="header">
            <div class="logo">المكتبة الوطنية للمملكة المغربية</div>
            <div class="logo">Bibliothèque Nationale du Royaume du Maroc</div>
            <h1>CERTIFICAT D'ACHÈVEMENT DE RESTAURATION</h1>
          </div>
          
          <div class="section">
            <p>La Bibliothèque Nationale du Royaume du Maroc certifie que les travaux de restauration du manuscrit suivant ont été menés à bien:</p>
          </div>
          
          <table class="info-table">
            <tr>
              <th>Information</th>
              <th>Détail</th>
            </tr>
            <tr>
              <td>N° de demande</td>
              <td>${request.request_number}</td>
            </tr>
            <tr>
              <td>Titre</td>
              <td class="arabic">${request.manuscript_title}</td>
            </tr>
            <tr>
              <td>Cote</td>
              <td>${request.manuscript_cote}</td>
            </tr>
            <tr>
              <td>Date de début</td>
              <td>${new Date(request.submitted_at).toLocaleDateString('fr-FR')}</td>
            </tr>
            <tr>
              <td>Date d'achèvement</td>
              <td>${new Date().toLocaleDateString('fr-FR')}</td>
            </tr>
            <tr>
              <td>Montant total</td>
              <td>${request.quote_amount ? request.quote_amount.toLocaleString('fr-FR') + ' DH' : 'N/A'}</td>
            </tr>
          </table>
          
          ${request.restoration_report ? `
            <div class="section">
              <div class="section-title">Rapport final</div>
              <div class="content-box arabic">${request.restoration_report}</div>
            </div>
          ` : ''}
          
          <div class="signature">
            <p><strong>Fait à Rabat, le ${new Date().toLocaleDateString('fr-FR')}</strong></p>
            <p style="margin-top: 40px;"><strong>Le Directeur de la BNRM</strong></p>
          </div>
          
          <div class="footer">
            Page 1 - Document généré le ${new Date().toLocaleDateString('fr-FR')}
          </div>
        </body>
        </html>
      `;

    default:
      return '<html><body><h1>Type de document inconnu</h1></body></html>';
  }
}
