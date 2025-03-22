package mg.sarobidy.ventecosmetique.service;

import mg.sarobidy.ventecosmetique.entity.Avis;
import mg.sarobidy.ventecosmetique.entity.Produit;
import mg.sarobidy.ventecosmetique.entity.User;
import mg.sarobidy.ventecosmetique.repository.AvisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AvisService {
    @Autowired private AvisRepository avisRepository;

    public List<Avis> getAllReviews() {
        return avisRepository.findAll();
    }

    public List<Avis> getReviewsByProductId(Long productId) {
        return avisRepository.findByProduitId(productId);
    }

    public Avis addReview(Long userId, Long productId, int note, String commentaire) {
        Avis avis = new Avis();
        avis.setUtilisateur(new User());
        avis.getUtilisateur().setId(userId);
        avis.setProduit(new Produit());
        avis.getProduit().setId(productId);
        avis.setNote(note);
        avis.setCommentaire(commentaire);
        avis.setDateCreation(LocalDateTime.now());
        return avisRepository.save(avis);
    }

    public void deleteReview(Long id) {
        avisRepository.deleteById(id);
    }
}