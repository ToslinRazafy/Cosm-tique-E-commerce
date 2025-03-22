package mg.sarobidy.ventecosmetique.service;

import mg.sarobidy.ventecosmetique.entity.HistoriqueStock;
import mg.sarobidy.ventecosmetique.entity.Produit;
import mg.sarobidy.ventecosmetique.entity.Stock;
import mg.sarobidy.ventecosmetique.repository.HistoriqueStockRepository;
import mg.sarobidy.ventecosmetique.repository.ProduitRepository;
import mg.sarobidy.ventecosmetique.repository.StockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ProduitService {
    @Autowired private ProduitRepository produitRepository;
    @Autowired private StockRepository stockRepository;
    @Autowired private HistoriqueStockRepository historiqueStockRepository;

    public List<Produit> getAllProducts() {
        return produitRepository.findAll();
    }

    public Produit getProductById(Long id) {
        return produitRepository.findById(id).orElseThrow(() -> new RuntimeException("Produit not found"));
    }

    public Produit saveProduct(Produit produit, MultipartFile image) throws IOException {
        if (image != null && !image.isEmpty()) {
            String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
            Path path = Paths.get("uploads/" + fileName);
            Files.createDirectories(path.getParent());
            Files.write(path, image.getBytes());
            produit.setImagePath("/uploads/" + fileName);
        }
        Produit savedProduit = produitRepository.save(produit);
        Stock stock = new Stock();
        stock.setProduit(savedProduit);
        stock.setQuantite(savedProduit.getStock());
        stock.setSeuilBas(savedProduit.getSeuilStockBas());
        stockRepository.save(stock);

        HistoriqueStock historique = new HistoriqueStock();
        historique.setAction("ajout du produit");
        historique.setQuantity(savedProduit.getStock());
        historique.setDate(LocalDateTime.now());
        historique.setProduit(savedProduit);
        historiqueStockRepository.save(historique);
        return savedProduit;
    }

    public Produit updateProduct(Long id, Produit produitDetails, MultipartFile image) throws IOException {
        Produit produit = getProductById(id);
        produit.setNom(produitDetails.getNom());
        produit.setPrix(produitDetails.getPrix());
        produit.setPrixOriginal(produitDetails.getPrixOriginal());
        produit.setStock(produitDetails.getStock());
        produit.setDescription(produitDetails.getDescription());
        produit.setMarque(produitDetails.getMarque());
        produit.setIngredients(produitDetails.getIngredients());
        produit.setDateExpiration(produitDetails.getDateExpiration());
        produit.setSeuilStockBas(produitDetails.getSeuilStockBas());
        produit.setCategorie(produitDetails.getCategorie());

        if (image != null && !image.isEmpty()) {
            String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
            Path path = Paths.get("uploads/" + fileName);
            Files.createDirectories(path.getParent());
            Files.write(path, image.getBytes());
            produit.setImagePath("/uploads/" + fileName);
        }
        Produit updatedProduit = produitRepository.save(produit);

        Stock stock = stockRepository.findByProduitId(updatedProduit.getId())
                .orElseGet(Stock::new); // Création d'un stock si non existant

        stock.setProduit(updatedProduit);
        stock.setQuantite(updatedProduit.getStock());
        stock.setSeuilBas(updatedProduit.getSeuilStockBas());

        HistoriqueStock historique = new HistoriqueStock();
        historique.setAction("Modification de produit");
        historique.setQuantity(updatedProduit.getStock());
        historique.setDate(LocalDateTime.now());
        historique.setProduit(updatedProduit);
        historiqueStockRepository.save(historique);

        stockRepository.save(stock);

        return updatedProduit;
    }

    public void deleteProduct(Long id) {
        produitRepository.deleteById(id);
        stockRepository.findByProduitId(id).ifPresent(stockRepository::delete);
    }
}