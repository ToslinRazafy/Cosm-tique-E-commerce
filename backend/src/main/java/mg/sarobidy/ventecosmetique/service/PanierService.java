package mg.sarobidy.ventecosmetique.service;

import mg.sarobidy.ventecosmetique.entity.*;
import mg.sarobidy.ventecosmetique.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class PanierService {
    @Autowired private PanierRepository panierRepository;
    @Autowired private PanierItemRepository panierItemRepository;
    @Autowired private ProduitRepository produitRepository;
    @Autowired private StockRepository stockRepository;
    @Autowired private HistoriqueStockRepository historiqueStockRepository;
    @Autowired private UserRepository userRepository;

    public Panier getCartByUserId(Long userId) {
        return panierRepository.findByUtilisateurId(userId)
                .orElseGet(() -> createNewCart(userId));
    }

    public Panier addToCart(Long userId, Long productId, int quantity) {
        Panier panier = getCartByUserId(userId);
        Produit produit = produitRepository.findById(productId).orElseThrow(() -> new RuntimeException("Produit not found"));
        if (produit.getStock() < quantity) throw new IllegalStateException("Stock insuffisant");

        PanierItem item = panier.getItems().stream()
                .filter(i -> i.getProduit().getId().equals(productId))
                .findFirst()
                .orElse(new PanierItem());

        item.setPanier(panier);
        item.setProduit(produit);
        item.setQuantite(item.getQuantite() + quantity);
        panierItemRepository.save(item);
        produit.setStock(produit.getStock() - quantity);
        Produit updatedProduit = produitRepository.save(produit);

        Stock stock = stockRepository.findByProduitId(produit.getId())
                .orElseGet(Stock::new);

        stock.setProduit(produit);
        stock.setQuantite(updatedProduit.getStock());
        stock.setSeuilBas(updatedProduit.getSeuilStockBas());
        stockRepository.save(stock);

        HistoriqueStock historique = new HistoriqueStock();
        historique.setAction("Ajout dans la panier");
        historique.setQuantity(updatedProduit.getStock());
        historique.setDate(LocalDateTime.now());
        historique.setProduit(updatedProduit);
        historiqueStockRepository.save(historique);

        return panierRepository.save(panier);
    }

    public void updateCartItem(Long itemId, int quantity) {
        PanierItem item = panierItemRepository.findById(itemId).orElseThrow(() -> new RuntimeException("Item not found"));
        Produit produit = item.getProduit();
        int currentQuantity = item.getQuantite();
        int stockDifference = quantity - currentQuantity;
        if (produit.getStock() < stockDifference) throw new IllegalStateException("Stock insuffisant");
        item.setQuantite(quantity);
        produit.setStock(produit.getStock() - stockDifference);
        Produit updatedProduit = produitRepository.save(produit);

        Stock stock = stockRepository.findByProduitId(produit.getId())
                .orElseGet(Stock::new);

        stock.setProduit(produit);
        stock.setQuantite(updatedProduit.getStock());
        stock.setSeuilBas(updatedProduit.getSeuilStockBas());
        stockRepository.save(stock);

        HistoriqueStock historique = new HistoriqueStock();
        historique.setAction("Modification dans la panier");
        historique.setQuantity(updatedProduit.getStock());
        historique.setDate(LocalDateTime.now());
        historique.setProduit(updatedProduit);
        historiqueStockRepository.save(historique);

        panierItemRepository.save(item);
    }

    public void removeFromCart(Long itemId) {
        PanierItem item = panierItemRepository.findById(itemId).orElseThrow(() -> new RuntimeException("Item not found"));
        Produit produit = item.getProduit();
        produit.setStock(produit.getStock() + item.getQuantite());
        Produit updatedProduit = produitRepository.save(produit);

        Stock stock = stockRepository.findByProduitId(produit.getId())
                .orElseGet(Stock::new);

        stock.setProduit(produit);
        stock.setQuantite(updatedProduit.getStock());
        stock.setSeuilBas(updatedProduit.getSeuilStockBas());
        stockRepository.save(stock);

        HistoriqueStock historique = new HistoriqueStock();
        historique.setAction("Suppression dans la panier");
        historique.setQuantity(updatedProduit.getStock());
        historique.setDate(LocalDateTime.now());
        historique.setProduit(updatedProduit);
        historiqueStockRepository.save(historique);

        panierItemRepository.delete(item);
    }

    @Transactional
    public void clearCart(Long userId) {

        Panier panier = panierRepository.findByUtilisateurId(userId)
                .orElseThrow(() -> new RuntimeException("Panier non trouvé pour l'utilisateur avec l'ID : " + userId));

        panierRepository.delete(panier);
    }

    private Panier createNewCart(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé pour l'ID : " + userId));

        Panier panier = new Panier();
        panier.setUtilisateur(user);
        return panierRepository.save(panier);
    }
}