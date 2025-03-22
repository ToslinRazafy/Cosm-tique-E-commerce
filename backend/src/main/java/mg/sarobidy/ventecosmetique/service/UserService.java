package mg.sarobidy.ventecosmetique.service;

import mg.sarobidy.ventecosmetique.entity.User;
import mg.sarobidy.ventecosmetique.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    @Autowired private UserRepository userRepository;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User createUser(User user) {
        user.setRole("CLIENT"); // Par défaut
        user.setBlocked(false);
        return userRepository.save(user);
    }

    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);
        user.setFirstName(userDetails.getFirstName());
        user.setLastName(userDetails.getLastName());
        user.setEmail(userDetails.getEmail());
        user.setRole(userDetails.getRole());
        user.setAddress(userDetails.getAddress());
        user.setCountry(userDetails.getCountry());
        return userRepository.save(user);
    }

    public User updatePassword(Long id, String currentPassword, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Mot de passe actuel incorrect");
        }

        // Encoder le nouveau mot de passe avant de le sauvegarder
        user.setPassword(passwordEncoder.encode(newPassword));
        return userRepository.save(user);
    }

    public void blockUser(Long id) {
        User user = getUserById(id);
        user.setBlocked(true);
        userRepository.save(user);
    }

    public void unblockUser(Long id) {
        User user = getUserById(id);
        user.setBlocked(false);
        userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}