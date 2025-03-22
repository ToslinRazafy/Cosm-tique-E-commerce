package mg.sarobidy.ventecosmetique.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import mg.sarobidy.ventecosmetique.entity.Commande;
import mg.sarobidy.ventecosmetique.entity.LigneCommande;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // Méthode générique pour envoyer un email en texte brut
    public void sendEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setFrom("CosmoPink <tosyrazafitsotra@gmail.com>");
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }

    public void sendEmailContact(String from, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo("tosyrazafitsotra@gmail.com");
        message.setFrom("CosmoPink Contact du Client " + from + " <tosyrazafitsotra@gmail.com>");
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }

    // Méthode générique pour envoyer un email HTML
    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setFrom("CosmoPink <tosyrazafitsotra@gmail.com>");
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true indique que c'est du HTML
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Erreur lors de l'envoi de l'email HTML", e);
        }
    }

    public void sendWelcomeEmail(String to, String firstName) {
        String subject = "Bienvenue chez Vente Cosmetique!";
        String text = String.format("Bonjour %s,\n\nBienvenue sur notre plateforme! Votre inscription est réussie.", firstName);
        sendEmail(to, subject, text);
    }

    public void sendOrderConfirmationEmail(Commande commande) {
        String subject = "Confirmation de votre commande #" + commande.getId();
        String firstName = commande.getUtilisateur().getFirstName() != null
                ? commande.getUtilisateur().getFirstName()
                : "Client";
        String email = commande.getUtilisateur().getEmail();
        if (email == null || email.isEmpty()) {
            throw new IllegalStateException("L'email de l'utilisateur est requis pour envoyer la confirmation.");
        }

        String htmlContent = buildOrderConfirmationHtml(commande, firstName);
        sendHtmlEmail(email, subject, htmlContent);
    }

    public void sendPaymentConfirmationEmail(Commande commande) {
        String subject = "Paiement confirmé pour la commande #" + commande.getId();
        String text = String.format("Bonjour %s,\n\nLe paiement de votre commande #%d a été confirmé.\nTotal: %.2f Ar\nStatut: %s",
                commande.getUtilisateur().getFirstName(), commande.getId(), commande.getTotal(), commande.getStatut());
        sendEmail(commande.getUtilisateur().getEmail(), subject, text);
    }

    public void sendStatusUpdateEmail(Commande commande) {
        String subject = "Mise à jour de votre commande #" + commande.getId();
        String text = String.format("Bonjour %s,\n\nLe statut de votre commande #%d a été mis à jour.\nNouveau statut: %s",
                commande.getUtilisateur().getFirstName(), commande.getId(), commande.getStatut());
        sendEmail(commande.getUtilisateur().getEmail(), subject, text);
    }

    private String buildOrderConfirmationHtml(Commande commande, String firstName) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html lang='fr'>");
        html.append("<head>");
        html.append("<meta charset='UTF-8'>");
        html.append("<meta name='viewport' content='width=device-width, initial-scale=1.0'>");
        html.append("<title>Confirmation de Commande</title>");
        html.append("<style>");
        html.append("body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f9f9f9; color: #333; }");
        html.append(".container { max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }");
        html.append(".header { background-color: #ff69b4; color: white; padding: 20px; text-align: center; }");
        html.append(".header h1 { margin: 0; font-size: 24px; }");
        html.append(".content { padding: 20px; }");
        html.append(".content h2 { color: #555; font-size: 18px; margin-bottom: 10px; }");
        html.append(".details p { margin: 5px 0; font-size: 14px; }");
        html.append("table { width: 100%; border-collapse: collapse; margin: 20px 0; }");
        html.append("th, td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }");
        html.append("th { background-color: #f5f5f5; font-weight: bold; color: #555; }");
        html.append("td { font-size: 14px; }");
        html.append(".total { text-align: right; font-size: 16px; font-weight: bold; color: #ff69b4; margin-top: 20px; }");
        html.append(".footer { text-align: center; padding: 20px; font-size: 12px; color: #777; border-top: 1px solid #eee; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        html.append("<div class='container'>");

        // Header
        html.append("<div class='header'>");
        html.append("<h1>Confirmation de Commande #" + commande.getId() + "</h1>");
        html.append("</div>");

        // Content
        html.append("<div class='content'>");
        html.append("<h2>Bonjour " + firstName + ",</h2>");
        html.append("<p>Votre commande a été enregistrée avec succès. Voici les détails :</p>");

        // Détails de la commande
        html.append("<div class='details'>");
        html.append("<p><strong>Date :</strong> " +
                commande.getDateCommande().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) + "</p>");
        html.append("<p><strong>Statut :</strong> " + commande.getStatut().toString() + "</p>");
        html.append("</div>");

        // Tableau des articles
        html.append("<table>");
        html.append("<thead>");
        html.append("<tr>");
        html.append("<th>N°</th>");
        html.append("<th>Produit</th>");
        html.append("<th>Quantité</th>");
        html.append("<th>Prix Unitaire</th>");
        html.append("<th>Total</th>");
        html.append("</tr>");
        html.append("</thead>");
        html.append("<tbody>");
        int index = 1;
        for (LigneCommande ligne : commande.getLignesCommande()) {
            html.append("<tr>");
            html.append("<td>" + index++ + "</td>");
            html.append("<td>" + ligne.getProduit().getNom() + "</td>");
            html.append("<td>" + ligne.getQuantite() + "</td>");
            html.append("<td>" + ligne.getProduit().getPrix() + " Ar</td>");
            html.append("<td>" +
                    ligne.getProduit().getPrix().multiply(java.math.BigDecimal.valueOf(ligne.getQuantite())) +
                    " Ar</td>");
            html.append("</tr>");
        }
        html.append("</tbody>");
        html.append("</table>");

        // Total
        html.append("<p class='total'>Total : " + commande.getTotal() + " Ar</p>");
        html.append("</div>");

        // Footer
        html.append("<div class='footer'>");
        html.append("<p>Merci de votre achat chez CosmoPink !</p>");
        html.append("<p>Contactez-nous à support@cosmopink.com pour toute question.</p>");
        html.append("</div>");

        html.append("</div>");
        html.append("</body>");
        html.append("</html>");

        return html.toString();
    }
}