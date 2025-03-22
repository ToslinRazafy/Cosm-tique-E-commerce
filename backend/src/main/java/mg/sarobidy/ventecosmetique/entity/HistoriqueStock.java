package mg.sarobidy.ventecosmetique.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "historique_stocks")
public class HistoriqueStock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "produit_id")
    private Produit produit;

    private String action;
    private int quantity;
    private LocalDateTime date;

}
