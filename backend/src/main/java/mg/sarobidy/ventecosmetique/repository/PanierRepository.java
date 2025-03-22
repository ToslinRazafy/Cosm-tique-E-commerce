package mg.sarobidy.ventecosmetique.repository;

import mg.sarobidy.ventecosmetique.entity.Panier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PanierRepository extends JpaRepository<Panier, Long> {
    Optional<Panier> findByUtilisateurId(Long utilisateurId);
}