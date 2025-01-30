import {
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { dbClient } from "../config/db";
import { Customer } from "../models/customerModel";
import { randomUUID } from "crypto";

const TABLE_NAME = process.env.TABLE_NAME || "customers";

export class CustomerService {
  static async createCustomer(data: Omit<Customer, "id">) {
    const id = randomUUID();
    const timestamp = new Date().toISOString();

    const newCustomer: Customer = {
      id,
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: newCustomer,
    });

    await dbClient.send(command);
    return newCustomer;
  }

  static async getCustomer(id: string) {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    });
    const response = await dbClient.send(command);
    return (response.Item as Customer) ?? null;
  }

  static async getAllCustomers() {
    const command = new ScanCommand({ TableName: TABLE_NAME });
    const response = await dbClient.send(command);
    return response.Items as Customer[];
  }

  static async updateCustomer(id: string, data: Partial<Omit<Customer, "id">>) {
    const timestamp = new Date().toISOString();
    data.updatedAt = timestamp;

    const updateExpression = Object.keys(data)
      .map((key, index) => `#${key} = :value${index}`)
      .join(", ");

    const expressionAttributeNames = Object.keys(data).reduce(
      (acc, key) => ({ ...acc, [`#${key}`]: key }),
      {}
    );

    const expressionAttributeValues = Object.values(data).reduce(
      (acc, value, index) => ({ ...acc, [`:value${index}`]: value }),
      {}
    );

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: `SET ${updateExpression}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    });

    const response = await dbClient.send(command);
    return response.Attributes as Customer;
  }

  static async deleteCustomer(id: string) {
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: "SET #active= :false",
      ExpressionAttributeNames: {
        "#active": "active",
      },
      ExpressionAttributeValues: {
        ":false": false,
      },
      ReturnValues: "ALL_NEW",
    });

    await dbClient.send(command);

    return { message: "Customer deleted successfully" };
  }
}
