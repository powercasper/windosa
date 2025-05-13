const request = require("supertest");
const express = require("express");
const router = require("../index"); // Adjust the path if necessary

const app = express();
app.use(express.json());
app.use("/", router);

describe("API Endpoints", () => {
  test("POST /add-window should add a new window", async () => {
    const response = await request(app)
      .post("/add-window")
      .send({
        systemType: "Windows",
        systemBrand: "Alumil",
        systemName: "S67",
        widthIn: 36,
        heightIn: 72,
        quantity: 2,
      });
    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Window added successfully.");
  });

  test("POST /add-window should return 400 for missing fields", async () => {
    const response = await request(app).post("/add-window").send({});
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("All fields are required.");
  });

  test("GET /summary should return the summary", async () => {
    await request(app)
      .post("/add-window")
      .send({
        systemType: "Windows",
        systemBrand: "Alumil",
        systemName: "S67",
        widthIn: 36,
        heightIn: 72,
        quantity: 2,
      });
    const response = await request(app).get("/summary").query({ margin: 10 });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("totalArea");
    expect(response.body).toHaveProperty("totalCost");
    expect(response.body).toHaveProperty("laborTotal");
    expect(response.body).toHaveProperty("grandTotal");
    expect(response.body).toHaveProperty("totalWithMargin");
    expect(response.body).toHaveProperty("itemized");
  });

  test("PUT /update-window/:id should update a window", async () => {
    await request(app)
      .post("/add-window")
      .send({
        systemType: "Windows",
        systemBrand: "Alumil",
        systemName: "S67",
        widthIn: 36,
        heightIn: 72,
        quantity: 2,
      });
    const response = await request(app)
      .put("/update-window/0")
      .send({
        systemType: "Entrance Doors",
        systemBrand: "Reynaers",
        systemName: "SlimLine 38 Classic",
        widthIn: 48,
        heightIn: 84,
        quantity: 1,
      });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Window updated successfully.");
  });

  test("DELETE /delete-window/:index should delete a window", async () => {
    await request(app)
      .post("/add-window")
      .send({
        systemType: "Windows",
        systemBrand: "Alumil",
        systemName: "S67",
        widthIn: 36,
        heightIn: 72,
        quantity: 2,
      });
    const response = await request(app).delete("/delete-window/0");
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Window deleted successfully.");
  });
});