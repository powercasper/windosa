const express = require('express');
const router = express.Router();

// Calculate final pricing including all costs and margins
router.post('/calculate-pricing', (req, res) => {
  try {
    const { items, tariff, margin, shipping, delivery } = req.body;

    // Calculate total base cost from all items
    const totalBaseCost = items.reduce((sum, item) => sum + item.price, 0);

    // Calculate packaging cost (2% of base cost)
    const packagingCost = totalBaseCost * 0.02;

    // Calculate tariff cost
    const tariffCost = totalBaseCost * (tariff / 100);

    // Calculate Total Cost Delivered USA
    const totalCostUSA = totalBaseCost + tariffCost + parseFloat(shipping) + packagingCost + parseFloat(delivery);

    // Calculate Sale Price
    const marginDecimal = margin / 100;
    const salePrice = totalCostUSA / (1 - marginDecimal);

    res.json({
      totalBaseCost,
      packagingCost,
      tariffCost,
      totalCostUSA,
      salePrice
    });
  } catch (error) {
    console.error('Error calculating pricing:', error);
    res.status(500).json({ error: 'Error calculating pricing' });
  }
});

module.exports = router; 