package mg.sarobidy.ventecosmetique.controller;

import mg.sarobidy.ventecosmetique.entity.*;
import mg.sarobidy.ventecosmetique.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    @Autowired private UserService userService;
    @Autowired private ProduitService produitService;
    @Autowired private CategorieService categorieService;
    @Autowired private CommandeService commandeService;
    @Autowired private AvisService avisService;
    @Autowired private PromotionService promotionService;
    @Autowired private StockService stockService;

    // Gestion des utilisateurs
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @PostMapping("/users")
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    @PutMapping("/users/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        return userService.updateUser(id, userDetails); // Inclut la modification du rôle
    }

    @PutMapping("/users/{id}/update-password")
    public ResponseEntity<User> updatePassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> passwordData
    ) {
        String currentPassword = passwordData.get("currentPassword");
        String newPassword = passwordData.get("newPassword");

        if (currentPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().build();
        }

        User updatedUser = userService.updatePassword(id, currentPassword, newPassword);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/users/{id}/block")
    public void blockUser(@PathVariable Long id) {
        userService.blockUser(id);
    }

    @PutMapping("/users/{id}/unblock")
    public void unblockUser(@PathVariable Long id) {
        userService.unblockUser(id);
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    // Gestion des produits
    @GetMapping("/products")
    public List<Produit> getProducts() {
        return produitService.getAllProducts();
    }

    @PostMapping("/products")
    public Produit createProduct(@RequestPart("produit") Produit produit, @RequestPart(value = "image", required = false) MultipartFile image) throws IOException, IOException {
        return produitService.saveProduct(produit, image);
    }

    @PutMapping("/products/{id}")
    public Produit updateProduct(@PathVariable Long id, @RequestPart("produit") Produit produit, @RequestPart(value = "image", required = false) MultipartFile image) throws IOException {
        return produitService.updateProduct(id, produit, image);
    }

    @DeleteMapping("/products/{id}")
    public void deleteProduct(@PathVariable Long id) {
        produitService.deleteProduct(id);
    }

    // Gestion des catégories
    @GetMapping("/categories")
    public List<Categorie> getCategories() {
        return categorieService.getAllCategories();
    }

    @PostMapping("/categories")
    public Categorie createCategory(@RequestBody Categorie categorie) {
        return categorieService.saveCategory(categorie);
    }

    @PutMapping("/categories/{id}")
    public Categorie updateCategory(@PathVariable Long id, @RequestBody Categorie categorie) {
        return categorieService.updateCategory(id, categorie);
    }

    @DeleteMapping("/categories/{id}")
    public void deleteCategory(@PathVariable Long id) {
        categorieService.deleteCategory(id);
    }

    // Gestion des commandes
    @GetMapping("/orders")
    public List<Commande> getAllOrders() {
        return commandeService.getAllOrders();
    }

    @GetMapping("/orders/{id}")
    public Commande getOrder(@PathVariable Long id) {
        return commandeService.getOrderById(id);
    }

    @PutMapping("/orders/{id}/status")
    public void updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        commandeService.updateOrderStatus(id, Commande.Statut.valueOf(body.get("status")));
    }

    // Gestion des avis
    @GetMapping("/reviews")
    public List<Avis> getAllReviews() {
        return avisService.getAllReviews();
    }

    @DeleteMapping("/reviews/{id}")
    public void deleteReview(@PathVariable Long id) {
        avisService.deleteReview(id);
    }

    // Gestion des promotions
    @GetMapping("/promotions")
    public List<Promotion> getAllPromotions() {
        return promotionService.getAllPromotions();
    }

    @PostMapping("/promotions")
    public Promotion addPromotion(@RequestBody Map<String, Object> body) {
        Long productId = Long.valueOf(body.get("productId").toString());
        double reductionPourcentage = Double.parseDouble(body.get("reductionPourcentage").toString());
        LocalDateTime dateDebut = LocalDateTime.parse(body.get("dateDebut").toString());
        LocalDateTime dateFin = LocalDateTime.parse(body.get("dateFin").toString());
        return promotionService.addPromotion(productId, reductionPourcentage, dateDebut, dateFin);
    }

    @DeleteMapping("/promotions/{id}")
    public void deletePromotion(@PathVariable Long id) {
        promotionService.deletePromotion(id);
    }

    // Gestion des stocks
    @GetMapping("/stocks")
    public List<Stock> getAllStocks() {
        return stockService.getAllStocks();
    }

    @GetMapping("/stocks/low")
    public List<Stock> getLowStockAlerts() {
        return stockService.getLowStockAlerts();
    }

    @PutMapping("/stocks/{productId}")
    public Stock updateStock(@PathVariable Long productId, @RequestBody Map<String, Object> body) {
        int quantity = Integer.parseInt(body.get("quantity").toString());
        boolean isAddition = Boolean.parseBoolean(body.get("isAddition").toString());
        return stockService.updateStock(productId, quantity, isAddition);
    }

    @GetMapping("/historique-stock")
    public List<HistoriqueStock> getHistoriqueStock() {
        return stockService.getHistoriqueStocks();
    }
}