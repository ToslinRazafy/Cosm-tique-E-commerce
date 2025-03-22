package mg.sarobidy.ventecosmetique.service;

import mg.sarobidy.ventecosmetique.entity.Categorie;
import mg.sarobidy.ventecosmetique.repository.CategorieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategorieService {
    @Autowired private CategorieRepository categorieRepository;

    public List<Categorie> getAllCategories() {
        return categorieRepository.findAll();
    }

    public Categorie getCategoryById(Long id) {
        return categorieRepository.findById(id).orElseThrow(() -> new RuntimeException("Categorie not found"));
    }

    public Categorie saveCategory(Categorie categorie) {
        return categorieRepository.save(categorie);
    }

    public Categorie updateCategory(Long id, Categorie categorieDetails) {
        Categorie categorie = getCategoryById(id);
        categorie.setNom(categorieDetails.getNom());
        categorie.setDescription(categorieDetails.getDescription());
        return categorieRepository.save(categorie);
    }

    public void deleteCategory(Long id) {
        categorieRepository.deleteById(id);
    }
}