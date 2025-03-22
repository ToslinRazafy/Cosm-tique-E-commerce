package mg.sarobidy.ventecosmetique.service;

import mg.sarobidy.ventecosmetique.entity.Promotion;
import mg.sarobidy.ventecosmetique.entity.Produit;
import mg.sarobidy.ventecosmetique.repository.ProduitRepository;
import mg.sarobidy.ventecosmetique.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PromotionService {
    @Autowired private PromotionRepository promotionRepository;
    @Autowired
    private ProduitRepository produitRepository;

    public List<Promotion> getAllPromotions() {
        return promotionRepository.findAll();
    }

    public List<Promotion> getActivePromotions() {
        return promotionRepository.findByDateFinAfter(LocalDateTime.now());
    }

    public Promotion addPromotion(Long productId, double reductionPourcentage, LocalDateTime dateDebut, LocalDateTime dateFin) {
        Produit produit = produitRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Produit avec l'ID " + productId + " non trouvé"));

        Promotion promotion = new Promotion();
        promotion.setProduit(produit);

        produit.setPrixOriginal(produit.getPrix());

        BigDecimal prixActuel = produit.getPrix();
        BigDecimal reduction = BigDecimal.valueOf(reductionPourcentage / 100);
        BigDecimal prixReduit = prixActuel.multiply(BigDecimal.ONE.subtract(reduction));

        produit.setPrix(prixReduit);

        promotion.setReductionPourcentage(reductionPourcentage);
        promotion.setDateDebut(dateDebut);
        promotion.setDateFin(dateFin);

        produitRepository.save(produit);

        return promotionRepository.save(promotion);
    }

    public void deletePromotion(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Promotion avec l'ID " + id + " non trouvée"));

        Produit produit = promotion.getProduit();

        if (produit.getPrixOriginal() != null) {
            produit.setPrix(produit.getPrixOriginal());
            produit.setPrixOriginal(BigDecimal.valueOf(0));
        }

        produitRepository.save(produit);

        promotionRepository.deleteById(id);
    }
}