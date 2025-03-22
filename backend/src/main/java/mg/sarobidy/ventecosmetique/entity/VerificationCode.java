package mg.sarobidy.ventecosmetique.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "verification_codes")
public class VerificationCode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "l'email est requis")
    private String email;
    @NotBlank(message = "Le code est requis")
    private String code;

    private LocalDateTime expirationDate;
}