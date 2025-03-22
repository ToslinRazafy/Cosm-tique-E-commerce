package mg.sarobidy.ventecosmetique.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
@Table(name = "paniers")
public class Panier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "utilisateur_id")
    private User utilisateur;

    @OneToMany(mappedBy = "panier", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<PanierItem> items;
}