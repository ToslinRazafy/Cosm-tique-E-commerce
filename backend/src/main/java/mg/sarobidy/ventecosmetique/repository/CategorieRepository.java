package mg.sarobidy.ventecosmetique.repository;

import mg.sarobidy.ventecosmetique.entity.Categorie;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategorieRepository extends JpaRepository<Categorie, Long> {
}