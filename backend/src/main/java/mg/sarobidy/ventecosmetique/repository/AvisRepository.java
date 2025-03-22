package mg.sarobidy.ventecosmetique.repository;

import mg.sarobidy.ventecosmetique.entity.Avis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AvisRepository extends JpaRepository<Avis, Long> {
    List<Avis> findByProduitId(Long produitId);
}