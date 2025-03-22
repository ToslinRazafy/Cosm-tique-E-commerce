package mg.sarobidy.ventecosmetique.controller;

import jakarta.transaction.Transactional;
import mg.sarobidy.ventecosmetique.entity.User;
import mg.sarobidy.ventecosmetique.entity.VerificationCode;
import mg.sarobidy.ventecosmetique.repository.UserRepository;
import mg.sarobidy.ventecosmetique.repository.VerificationCodeRepository;
import mg.sarobidy.ventecosmetique.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private VerificationCodeRepository verificationCodeRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        System.out.println("Tentative de connexion avec email: " + loginRequest.getEmail());
        try {
            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                throw new RuntimeException("Mot de passe incorrect");
            }

            userRepository.save(user);
            System.out.println("Connexion réussie pour: " + user.getEmail());

            return ResponseEntity.ok(Map.of("user", user, "message", "Connexion réussie"));
        } catch (Exception e) {
            System.out.println("Échec de la connexion: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Échec de la connexion : " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<?> register(@RequestBody User registerRequest) {
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Cet email est déjà utilisé."));
        }

        verificationCodeRepository.deleteByEmail(registerRequest.getEmail());
        String otp = String.format("%06d", new Random().nextInt(999999));

        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setEmail(registerRequest.getEmail());
        verificationCode.setCode(otp);
        verificationCode.setExpirationDate(LocalDateTime.now().plusMinutes(5));
        verificationCodeRepository.save(verificationCode);

        emailService.sendEmail(registerRequest.getEmail(), "Confirmation d'inscription", "Votre code OTP est : " + otp);
        return ResponseEntity.ok(Map.of("message", "OTP envoyé pour confirmation", "email", registerRequest.getEmail()));
    }

    @PostMapping("/verify-otp")
    @Transactional
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, Object> request) {
        String email = (String) request.get("email");
        String code = (String) request.get("code");
        Map<String, Object> userData = (Map<String, Object>) request.get("user");

        VerificationCode verify = verificationCodeRepository.findVerificationCodeByCodeAndEmail(code, email)
                .orElseThrow(() -> new RuntimeException("Code invalide"));

        if (verify.getExpirationDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Code invalide ou expiré");
        }

        User user = new User();
        user.setFirstName((String) userData.get("nom"));
        user.setLastName((String) userData.get("prenom"));
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode((String) userData.get("motDePasse")));
        user.setRole("CLIENT");
        user.setBlocked(false);
        user.setAddress((String) userData.get("addresse"));
        user.setCountry((String) userData.get("pays"));

        User savedUser = userRepository.save(user);
        verificationCodeRepository.delete(verify);
        emailService.sendWelcomeEmail(email, user.getFirstName());
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/reset-password/request")
    public ResponseEntity<?> requestResetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setResetPassword(otp);
        user.setExpirationDatePassword(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        emailService.sendEmail(email, "Réinitialisation de mot de passe", "Votre code OTP est : " + otp);
        return ResponseEntity.ok("OTP envoyé pour réinitialisation.");
    }

    @PostMapping("/reset-password/confirm")
    public ResponseEntity<?> confirmResetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("resetPassword");
        String newPassword = request.get("motDePasse");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (!code.equals(user.getResetPassword()) || user.getExpirationDatePassword().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Code OTP invalide ou expiré");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPassword(null);
        user.setExpirationDatePassword(null);
        userRepository.save(user);

        return ResponseEntity.ok("Mot de passe réinitialisé avec succès.");
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
            userRepository.save(user);
            return ResponseEntity.ok("Déconnexion réussie");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erreur lors de la déconnexion : " + e.getMessage());
        }
    }
}