package mg.sarobidy.ventecosmetique.repository;

import mg.sarobidy.ventecosmetique.entity.Favori;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriRepository extends JpaRepository<Favori, Long> {
    List<Favori> findByUtilisateurId(Long userId);
    Optional<Favori> findByUtilisateurIdAndProduitId(Long userId, Long produitId);
}