package mg.sarobidy.ventecosmetique.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom est requis")
    private String firstName;

    private String lastName;

    @Email(message = "Email invalide")
    @NotBlank(message = "L'email est requis")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "Le mot de passe est requis")
    private String password;

    private String address;
    private String country;

    private String role; // "CLIENT" ou "ADMIN"

    private boolean blocked;

    private String resetPassword;
    private LocalDateTime expirationDatePassword;

}