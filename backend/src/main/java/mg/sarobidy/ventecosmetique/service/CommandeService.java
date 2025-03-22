package mg.sarobidy.ventecosmetique.service;

import mg.sarobidy.ventecosmetique.entity.*;
import mg.sarobidy.ventecosmetique.repository.CommandeRepository;
import mg.sarobidy.ventecosmetique.repository.LigneCommandeRepository;
import mg.sarobidy.ventecosmetique.repository.PanierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommandeService {
    @Autowired private CommandeRepository commandeRepository;
    @Autowired private PanierRepository panierRepository;
    @Autowired private LigneCommandeRepository ligneCommandeRepository;
    @Autowired private EmailService emailService;

    public Commande createOrder(Long userId) {
        Panier panier = panierRepository.findByUtilisateurId(userId)
                .orElseThrow(() -> new RuntimeException("Panier not found"));
        if (panier.getItems().isEmpty()) throw new IllegalStateException("Panier vide");

        Commande commande = new Commande();
        commande.setUtilisateur(panier.getUtilisateur());
        commande.setDateCommande(LocalDateTime.now());
        commande.setStatut(Commande.Statut.EN_ATTENTE);

        List<LigneCommande> lignes = panier.getItems().stream().map(item -> {
            LigneCommande ligne = new LigneCommande();
            ligne.setCommande(commande);
            ligne.setProduit(item.getProduit());
            ligne.setQuantite(item.getQuantite());
            return ligne;
        }).collect(Collectors.toList());

        commande.setLignesCommande(lignes);
        commande.setTotal(panier.getItems().stream()
                .mapToDouble(item -> item.getProduit().getPrix().doubleValue() * item.getQuantite())
                .sum());

        Commande savedCommande = commandeRepository.save(commande);
        ligneCommandeRepository.saveAll(lignes);


        emailService.sendOrderConfirmationEmail(savedCommande);


        return savedCommande;
    }

    public List<Commande> getOrdersByUserId(Long userId) {
        return commandeRepository.findByUtilisateurId(userId);
    }

    public List<Commande> getAllOrders() {
        return commandeRepository.findAll();
    }

    public Commande getOrderById(Long orderId) {
        return commandeRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Commande not found"));
    }

    public void updateOrderStatus(Long orderId, Commande.Statut status) {
        Commande commande = getOrderById(orderId);
        commande.setStatut(status);

        Commande saveCommande = commandeRepository.save(commande);

//        if(saveCommande.getStatut().equals(Commande.Statut.LIVRE)){
//            emailService.sendPaymentConfirmationEmail(saveCommande);
//        }

    }

    public void cancelOrder(Long orderId) {
        Commande commande = getOrderById(orderId);
        if (commande.getStatut() == Commande.Statut.EN_ATTENTE) {
            commande.setStatut(Commande.Statut.ANNULE);
            commandeRepository.save(commande);
        } else {
            throw new IllegalStateException("Commande ne peut pas être annulée");
        }
    }


}