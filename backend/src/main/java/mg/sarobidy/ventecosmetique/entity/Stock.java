package mg.sarobidy.ventecosmetique.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "stocks")
public class Stock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "produit_id")
    private Produit produit;

    private int quantite;
    private int seuilBas;
}