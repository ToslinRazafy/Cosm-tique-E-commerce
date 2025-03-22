package mg.sarobidy.ventecosmetique.repository;

import mg.sarobidy.ventecosmetique.entity.PanierItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PanierItemRepository extends JpaRepository<PanierItem, Long> {
    List<PanierItem> findByPanierId(Long panierId);
}