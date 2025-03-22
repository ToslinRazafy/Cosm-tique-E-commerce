package mg.sarobidy.ventecosmetique.repository;

import mg.sarobidy.ventecosmetique.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface StockRepository extends JpaRepository<Stock, Long> {
    // Recherche d'un stock par ID de produit
    Optional<Stock> findByProduitId(Long produitId);

    // Liste des stocks où la quantité est inférieure au seuil bas
    @Query("SELECT s FROM Stock s WHERE s.quantite < s.seuilBas")
    List<Stock> findByQuantiteLessThanSeuilBas();
}