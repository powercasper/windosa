const WindowOrder = require("../index"); // Adjust the path if necessary

describe("WindowOrder Class", () => {
  let order;

  beforeEach(() => {
    order = new WindowOrder();
  });

  test("should add a new window", () => {
    order.addWindow("Fixed", 36, 72, 2);
    const windows = order.getWindows();
    expect(windows.length).toBe(1);
    expect(windows[0].type).toBe("Fixed");
    expect(windows[0].quantity).toBe(2);
  });

  test("should throw an error for invalid window type", () => {
    expect(() => {
      order.addWindow("InvalidType", 36, 72, 1);
    }).toThrow("Invalid window type");
  });

  test("should update an existing window", () => {
    order.addWindow("Fixed", 36, 72, 2);
    order.updateWindow(0, { type: "Tilt & Turn", widthIn: 48, heightIn: 84, quantity: 1 });
    const windows = order.getWindows();
    expect(windows[0].type).toBe("Tilt & Turn");
    expect(windows[0].quantity).toBe(1);
  });

  test("should delete a window", () => {
    order.addWindow("Fixed", 36, 72, 2);
    order.deleteWindow(0);
    expect(order.getWindows().length).toBe(0);
  });

  test("should calculate total cost", () => {
    order.addWindow("Fixed", 36, 72, 2);
    const totalCost = order.getTotalCost();
    expect(parseFloat(totalCost)).toBeGreaterThan(0);
  });

  test("should calculate total labor cost", () => {
    order.addWindow("Fixed", 36, 72, 2);
    const laborCost = order.getTotalLaborCost();
    expect(parseFloat(laborCost)).toBeGreaterThan(0);
  });

  test("should calculate total area", () => {
    order.addWindow("Fixed", 36, 72, 2);
    const totalArea = order.getTotalArea();
    expect(parseFloat(totalArea)).toBeGreaterThan(0);
  });

  test("should calculate grand total", () => {
    order.addWindow("Fixed", 36, 72, 2);
    const grandTotal = order.getGrandTotal();
    expect(parseFloat(grandTotal)).toBeGreaterThan(0);
  });

  test("should calculate total with margin", () => {
    order.addWindow("Fixed", 36, 72, 2);
    const totalWithMargin = order.getTotalWithMargin(10);
    expect(parseFloat(totalWithMargin)).toBeGreaterThan(0);
  });

  test("should return a summary", () => {
    order.addWindow("Fixed", 36, 72, 2);
    const summary = order.getSummary(10);
    expect(summary).toHaveProperty("totalArea");
    expect(summary).toHaveProperty("totalCost");
    expect(summary).toHaveProperty("laborTotal");
    expect(summary).toHaveProperty("grandTotal");
    expect(summary).toHaveProperty("totalWithMargin");
    expect(summary).toHaveProperty("itemized");
  });
});