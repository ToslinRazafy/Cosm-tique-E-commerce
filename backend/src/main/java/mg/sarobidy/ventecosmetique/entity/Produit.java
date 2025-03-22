package mg.sarobidy.ventecosmetique.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Data
@Table(name = "produits")
public class Produit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private BigDecimal prix;

    private BigDecimal prixOriginal;
    private int stock;
    private String imagePath;
    private String description;
    private String marque;
    private String ingredients;
    private String dateExpiration;
    private int seuilStockBas;

    @ManyToOne
    @JoinColumn(name = "categorie_id")
    @JsonBackReference
    private Categorie categorie;

    @OneToMany(mappedBy = "produit", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Avis> avis;

}