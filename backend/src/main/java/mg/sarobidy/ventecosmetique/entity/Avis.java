package mg.sarobidy.ventecosmetique.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "avis")
public class Avis {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "produit_id")
    @JsonBackReference
    private Produit produit;

    @ManyToOne
    @JoinColumn(name = "utilisateur_id")
    private User utilisateur;

    private int note;
    private String commentaire;
    private LocalDateTime dateCreation;
}