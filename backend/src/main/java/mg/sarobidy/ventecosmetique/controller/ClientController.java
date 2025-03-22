package mg.sarobidy.ventecosmetique.controller;

import mg.sarobidy.ventecosmetique.entity.*;
import mg.sarobidy.ventecosmetique.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/client")
public class ClientController {
    @Autowired private ProduitService produitService;
    @Autowired private CategorieService categorieService;
    @Autowired private PanierService panierService;
    @Autowired private FavoriService favoriService;
    @Autowired private CommandeService commandeService;
    @Autowired private AvisService avisService;
    @Autowired private PromotionService promotionService;
    @Autowired private UserService userService;
    @Autowired private EmailService emailService;

    // Gestion des produits
    @GetMapping("/products")
    public List<Produit> getProducts() {
        return produitService.getAllProducts();
    }

    @GetMapping("/products/{id}")
    public Produit getProduct(@PathVariable Long id) {
        return produitService.getProductById(id);
    }

    // Gestion des catégories
    @GetMapping("/categories")
    public List<Categorie> getCategories() {
        return categorieService.getAllCategories();
    }

    @GetMapping("/cart")
    public Panier getCart(@RequestParam("userId") Long userId) {
        return panierService.getCartByUserId(userId);
    }

    @PostMapping("/cart/add")
    public Panier addToCart(@RequestBody Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("userId").toString());
        Long productId = Long.valueOf(body.get("productId").toString());
        int quantity = Integer.parseInt(body.get("quantity").toString());
        return panierService.addToCart(userId, productId, quantity);
    }

    @PutMapping("/cart/update/{itemId}")
    public void updateCartItem(@PathVariable Long itemId, @RequestBody Map<String, Integer> body) {
        panierService.updateCartItem(itemId, body.get("quantity"));
    }

    @DeleteMapping("/cart/remove/{itemId}")
    public void removeFromCart(@PathVariable Long itemId) {
        panierService.removeFromCart(itemId);
    }

    @DeleteMapping("/cart/clear")
    public void clearCart(@RequestParam("userId") Long userId) {
        panierService.clearCart(userId);
    }

    // Gestion des favoris
    @GetMapping("/favorites")
    public List<Favori> getFavorites(@RequestParam("userId") Long userId) {
        return favoriService.getFavoritesByUserId(userId);
    }

    @PostMapping("/favorites/add")
    public Favori addToFavorites(@RequestBody Map<String, Long> body) {
        Long userId = body.get("userId");
        Long productId = body.get("productId");
        return favoriService.addToFavorites(userId, productId);
    }

    @DeleteMapping("/favorites/remove/{productId}")
    public void removeFromFavorites(@PathVariable Long productId, @RequestParam("userId") Long userId) {
        favoriService.removeFromFavorites(userId, productId);
    }

    // Gestion des commandes
    @PostMapping("/orders")
    public Commande createOrder(@RequestParam("userId") Long userId) {
        return commandeService.createOrder(userId);
    }

    @GetMapping("/orders")
    public List<Commande> getOrders(@RequestParam("userId") Long userId) {
        return commandeService.getOrdersByUserId(userId);
    }

    @GetMapping("/orders/{id}")
    public Commande getOrder(@PathVariable Long id) {
        return commandeService.getOrderById(id);
    }

    @PostMapping("/orders/{id}/cancel")
    public void cancelOrder(@PathVariable Long id) {
        commandeService.cancelOrder(id);
    }

    // Gestion des avis
    @PostMapping("/reviews")
    public Avis addReview(@RequestBody Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("userId").toString());
        Long productId = Long.valueOf(body.get("productId").toString());
        int note = Integer.parseInt(body.get("note").toString());
        String commentaire = body.get("commentaire").toString();
        return avisService.addReview(userId, productId, note, commentaire);
    }

    @GetMapping("/reviews/{productId}")
    public List<Avis> getReviews(@PathVariable Long productId) {
        return avisService.getReviewsByProductId(productId);
    }

    // Gestion des promotions
    @GetMapping("/promotions")
    public List<Promotion> getActivePromotions() {
        return promotionService.getActivePromotions();
    }

    // Gestion du profil utilisateur
    @GetMapping("/profile")
    public User getProfile(@RequestParam("userId") Long userId) {
        return userService.getUserById(userId);
    }

    @PostMapping("/contact")
    public void contact(@RequestBody Map<String, Object> body) {
        emailService.sendEmailContact((String) body.get("email"), (String) body.get("subject"), (String) body.get("message"));
    }
}