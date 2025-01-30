import { mockClient } from "aws-sdk-client-mock";
import {
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { dbClient } from "../config/db";
import { CustomerService } from "../services/customerService";

const dbMock = mockClient(dbClient);
import { Customer } from "../models/customerModel";
describe("CustomerService", () => {
  beforeEach(() => {
    dbMock.reset();
  });

  it("should create a customer", async () => {
    const customerData: Customer = {
      name: "John Doe",
      email: "john@example.com",
      birthDate: "01/01/1999",
      active: true,
      residentialAddress: "Av Castro Silva 444",
      businessAddress: "",
      otherAddress: "",
      phone_number: "85988889999",
      is_whatsapp: true,

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dbMock.on(PutCommand).resolves({});

    const result = await CustomerService.createCustomer(customerData);

    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("createdAt");
    expect(result).toHaveProperty("updatedAt");
    expect(result.name).toBe(customerData.name);
    expect(result.email).toBe(customerData.email);
  });

  it("should get a customer by id", async () => {
    const customer = {
      id: "d405176f-a468-4042-af21-94ef665a4d6c",
      name: "John Doe",
      email: "john@example.com",
    };
    dbMock.on(GetCommand).resolves({ Item: customer });

    const result = await CustomerService.getCustomer(
      "d405176f-a468-4042-af21-94ef665a4d6c"
    );
    expect(result).toEqual(customer);
  });

  it("should return null if customer does not exist", async () => {
    dbMock.on(GetCommand).resolves({ Item: undefined });

    const result = await CustomerService.getCustomer("999");
    expect(result).toBeNull();
  });

  it("should get all customers", async () => {
    const customers = [
      { id: "0c484ddb-e361-4afe-a3b2-9ca3fd7ccc56", name: "Alice" },
      { id: "0eba7654-3569-423d-b0bb-d622824cb492", name: "Bob" },
    ];
    dbMock.on(ScanCommand).resolves({ Items: customers });

    const result = await CustomerService.getAllCustomers();
    expect(result).toEqual(customers);
  });

  it("should update a customer", async () => {
    const updatedCustomer = {
      id: "13222ddf-ed70-4db9-9371-8984e7690a80",
      name: "John Updated 2",
      email: "john@example.com",
      updatedAt: expect.any(String),
    };

    dbMock.on(UpdateCommand).resolves({ Attributes: updatedCustomer });

    const result = await CustomerService.updateCustomer(
      "13222ddf-ed70-4db9-9371-8984e7690a80",
      {
        name: "John Updated 2",
      }
    );

    expect(result).toEqual(updatedCustomer);
  });

  it("should delete a customer", async () => {
    dbMock.on(UpdateCommand).resolves({ Attributes: { active: false } });

    const result = await CustomerService.deleteCustomer(
      "13222ddf-ed70-4db9-9371-8984e7690a80"
    );
    expect(result).toEqual({ message: "Customer deleted successfully" });
  });
});
