package mg.sarobidy.ventecosmetique.repository;

import mg.sarobidy.ventecosmetique.entity.LigneCommande;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LigneCommandeRepository extends JpaRepository<LigneCommande, Long> {
}