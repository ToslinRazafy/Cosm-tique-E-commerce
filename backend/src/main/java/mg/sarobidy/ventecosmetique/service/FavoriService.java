package mg.sarobidy.ventecosmetique.service;

import mg.sarobidy.ventecosmetique.entity.Favori;
import mg.sarobidy.ventecosmetique.entity.Produit;
import mg.sarobidy.ventecosmetique.entity.User;
import mg.sarobidy.ventecosmetique.repository.FavoriRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FavoriService {
    @Autowired private FavoriRepository favoriRepository;

    public List<Favori> getFavoritesByUserId(Long userId) {
        return favoriRepository.findByUtilisateurId(userId);
    }

    public Favori addToFavorites(Long userId, Long productId) {
        if (favoriRepository.findByUtilisateurIdAndProduitId(userId, productId).isPresent()) {
            throw new IllegalStateException("Produit déjà en favoris");
        }
        Favori favori = new Favori();
        favori.setUtilisateur(new User());
        favori.getUtilisateur().setId(userId);
        favori.setProduit(new Produit());
        favori.getProduit().setId(productId);
        return favoriRepository.save(favori);
    }

    public void removeFromFavorites(Long userId, Long productId) {
        Favori favori = favoriRepository.findByUtilisateurIdAndProduitId(userId, productId)
                .orElseThrow(() -> new RuntimeException("Favori not found"));
        favoriRepository.delete(favori);
    }
}