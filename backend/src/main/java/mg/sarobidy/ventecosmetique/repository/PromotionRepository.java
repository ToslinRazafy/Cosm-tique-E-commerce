package mg.sarobidy.ventecosmetique.repository;

import mg.sarobidy.ventecosmetique.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    List<Promotion> findByProduitId(Long produitId);
    List<Promotion> findByDateFinAfter(LocalDateTime date);
}