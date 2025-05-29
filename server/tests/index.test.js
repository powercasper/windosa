// server/index.test.js
const { Order } = require('../index');
const {
  unitCostPerSqft,
  laborRates
} = require('../db/metaData');

describe('Order.getItemized & getTotals', () => {
  let order;

  beforeEach(() => {
    order = new Order();
  });

  test('Windows: default fixed (no panelTypes)', () => {
    order.addOrUpdate(null, {
      brand: 'Alumil',
      systemType: 'Windows',
      system: 'S67',
      typology: '',
      widthIn: 36,
      heightIn: 72,
      quantity: 1,
      panelTypes: {}
    });

    const items = order.getItemized(0);
    expect(items).toHaveLength(1);
    const it = items[0];

    const area = (36 * 72) / 144; // 18 ft²
    const fixedCost = unitCostPerSqft.Alumil['S67'].Fixed;

    // CostPerWindow = fixedCost * area
    expect(parseFloat(it.CostPerWindow)).toBeCloseTo(fixedCost * area, 2);
    // LaborCost = laborRates.Fixed * area * quantity
    expect(parseFloat(it.LaborCost)).toBeCloseTo(laborRates.Fixed * area, 2);
    // TotalCost = CostPerWindow * quantity
    expect(parseFloat(it.TotalCost)).toBeCloseTo(fixedCost * area, 2);
    // GrandTotal = TotalCost + LaborCost
    expect(parseFloat(it.GrandTotal)).toBeCloseTo(
      fixedCost * area + laborRates.Fixed * area,
      2
    );
  });

  test('Windows: mixed panels (averaged costs)', () => {
    order.addOrUpdate(null, {
      brand: 'Alumil',
      systemType: 'Windows',
      system: 'S67',
      typology: 'XO',
      widthIn: 36,
      heightIn: 72,
      quantity: 2,
      panelTypes: {
        panelType_0: 'Fixed',
        panelType_1: 'Tilt & Turn'
      }
    });

    const it = order.getItemized(0)[0];
    const area = (36 * 72) / 144; // 18 ft²
    const avgCostPerSqft =
      (unitCostPerSqft.Alumil['S67'].Fixed +
        unitCostPerSqft.Alumil['S67']['Tilt & Turn']) /
      2;
    const avgLaborRate =
      (laborRates.Fixed + laborRates['Tilt & Turn']) / 2;

    expect(parseFloat(it.CostPerWindow)).toBeCloseTo(avgCostPerSqft * area, 2);
    expect(parseFloat(it.LaborCost)).toBeCloseTo(avgLaborRate * area * 2, 2);
  });

  test('Sliding Doors: uses config array + "Sliding Fixed" labor for fixed sash', () => {
    // the metaData for Alumil SMARTIA M450 includes a config with typology "OX"
    // and cost_per_sqft_per_unit = 30.61
    order.addOrUpdate(null, {
      brand: 'Alumil',
      systemType: 'Sliding Doors',
      system: 'SMARTIA M450',
      typology: 'OX',
      widthIn: 120,
      heightIn: 96,
      quantity: 1,
      panelTypes: {
        panelType_0: 'Fixed',
        panelType_1: 'Sliding →'
      }
    });

    const it = order.getItemized(0)[0];
    const area = (120 * 96) / 144; // 80 ft²

    // expect to pick up cost_per_sqft_per_unit from config
    const cfgList = unitCostPerSqft.Alumil['SMARTIA M450'];
    const cfg = cfgList.find(c => c.typology === 'OX');
    expect(parseFloat(it.CostPerWindow)).toBeCloseTo(cfg.cost_per_sqft_per_unit * area, 2);

    // laborRates["Sliding Fixed"] = 10, laborRates["Sliding →"] = 10
    const expectedLabor = ((10 + 10) / 2) * area;
    expect(parseFloat(it.LaborCost)).toBeCloseTo(expectedLabor, 2);

    // GrandTotal = cost+labor
    expect(parseFloat(it.GrandTotal)).toBeCloseTo(
      cfg.cost_per_sqft_per_unit * area + expectedLabor,
      2
    );
  });

  test('getTotals aggregates correctly including margin', () => {
    // add two identical simple windows
    const payload = {
      brand: 'Alumil',
      systemType: 'Windows',
      system: 'S67',
      typology: '',
      widthIn: 36,
      heightIn: 72,
      quantity: 1,
      panelTypes: {}
    };
    order.addOrUpdate(null, payload);
    order.addOrUpdate(null, payload);

    // margin 10%
    const m = 10;
    const items = order.getItemized(m);
    const totals = order.getTotals(m);

    // totalCost is sum of both TotalCost fields
    const sumTotalCost = items.reduce((sum, i) => sum + parseFloat(i.TotalCost), 0);
    expect(parseFloat(totals.totalCost)).toBeCloseTo(sumTotalCost, 2);

    // grandTotal is sum of each TotalWithMargin
    const sumWithMargin = items.reduce(
      (sum, i) => sum + parseFloat(i.TotalWithMargin),
      0
    );
    expect(parseFloat(totals.grandTotal)).toBeCloseTo(sumWithMargin, 2);

    // averageCostPerSqft = grandTotal / totalArea
    const totalArea = items.reduce(
      (sum, i) => sum + parseFloat(i.AreaFt2) * i.Quantity,
      0
    );
    expect(parseFloat(totals.averageCostPerSqft)).toBeCloseTo(
      sumWithMargin / totalArea,
      2
    );
  });
});
