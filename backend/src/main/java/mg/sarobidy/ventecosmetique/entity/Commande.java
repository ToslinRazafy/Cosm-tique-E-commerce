package mg.sarobidy.ventecosmetique.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@Table(name = "commandes")
public class Commande {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "utilisateur_id")
    private User utilisateur;

    private LocalDateTime dateCommande;
    private double total;

    @Enumerated(EnumType.STRING)
    private Statut statut;

    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<LigneCommande> lignesCommande;

    public enum Statut {
        EN_ATTENTE, EN_COURS_DE_TRAITEMENT, EXPEDIE, LIVRE, ANNULE
    }

}