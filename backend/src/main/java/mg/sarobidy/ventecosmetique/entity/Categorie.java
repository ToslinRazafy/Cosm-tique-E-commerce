package mg.sarobidy.ventecosmetique.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Entity
@Data
@Table(name = "categories")
public class Categorie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom est requis")
    private String nom;

    private  String description;

    @OneToMany(mappedBy = "categorie", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Produit> produits;
}