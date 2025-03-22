package mg.sarobidy.ventecosmetique.service;

import mg.sarobidy.ventecosmetique.entity.HistoriqueStock;
import mg.sarobidy.ventecosmetique.entity.Produit;
import mg.sarobidy.ventecosmetique.entity.Stock;
import mg.sarobidy.ventecosmetique.repository.HistoriqueStockRepository;
import mg.sarobidy.ventecosmetique.repository.ProduitRepository;
import mg.sarobidy.ventecosmetique.repository.StockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class StockService {
    @Autowired private StockRepository stockRepository;
    @Autowired private ProduitRepository produitRepository;
    @Autowired private HistoriqueStockRepository historiqueStockRepository;

    public List<Stock> getAllStocks() {
        return stockRepository.findAll();
    }

    public List<Stock> getLowStockAlerts() {
        return stockRepository.findByQuantiteLessThanSeuilBas();
    }

    public Stock updateStock(Long productId, int quantity, boolean isAddition) {
        Stock stock = stockRepository.findByProduitId(productId)
                .orElseThrow(() -> new RuntimeException("Stock not found"));
        stock.setQuantite(isAddition ? stock.getQuantite() + quantity : stock.getQuantite() - quantity);
        if (stock.getQuantite() < 0) throw new IllegalStateException("Stock ne peut pas être négatif");

        Produit produit = stock.getProduit();
        produit.setStock(isAddition ? produit.getStock() + quantity : produit.getStock() - quantity);

        produitRepository.save(produit);

        HistoriqueStock historique = new HistoriqueStock();
        historique.setAction(isAddition? "Entréé" : "Sortie");
        historique.setQuantity(quantity);
        historique.setDate(LocalDateTime.now());
        historique.setProduit(produit);
        historiqueStockRepository.save(historique);

        return stockRepository.save(stock);
    }

    public List<HistoriqueStock> getHistoriqueStocks() {
        return historiqueStockRepository.findAll();
    }

}