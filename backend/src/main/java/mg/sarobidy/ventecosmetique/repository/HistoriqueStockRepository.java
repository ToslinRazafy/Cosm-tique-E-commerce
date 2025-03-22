package mg.sarobidy.ventecosmetique.repository;

import mg.sarobidy.ventecosmetique.entity.HistoriqueStock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HistoriqueStockRepository extends JpaRepository<HistoriqueStock, Long> {
}

