import { APIGatewayProxyHandler } from "aws-lambda";
import { CustomerService } from "../services/customerService";

export const createCustomer: APIGatewayProxyHandler = async (event) => {
  try {
    const data = JSON.parse(event.body || "{}");
    const newCustomer = await CustomerService.createCustomer(data);

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Customer created successfully",
        newCustomer,
      }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error }) };
  }
};

export const getCustomer: APIGatewayProxyHandler = async (event) => {
  try {
    const id = event.pathParameters?.id;
    if (!id)
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "ID is required" }),
      };

    const customer = await CustomerService.getCustomer(id);

    if (!customer)
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Customer not found" }),
      };

    return { statusCode: 200, body: JSON.stringify(customer) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error }) };
  }
};

export const getAllCustomers: APIGatewayProxyHandler = async () => {
  try {
    const customers = await CustomerService.getAllCustomers();
    if (customers.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "No customers found" }),
      };
    }

    return { statusCode: 200, body: JSON.stringify(customers) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error }) };
  }
};

export const updateCustomer: APIGatewayProxyHandler = async (event) => {
  try {
    const id = event.pathParameters?.id;
    const data = JSON.parse(event.body || "{}");
    if (!id)
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "ID is required" }),
      };

    const customer = await CustomerService.getCustomer(id);
    if (!customer)
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Customer not found" }),
      };

    if (Object.keys(data).length === 0)
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No data provided to update" }),
      };

    const customerUpdate = await CustomerService.updateCustomer(id, data);

    return { statusCode: 200, body: JSON.stringify(customerUpdate) };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : "Erro desconhecido",
        stack: error instanceof Error ? error.stack : undefined,
      }),
    };
  }
};

export const deleteCustomer: APIGatewayProxyHandler = async (event) => {
  try {
    const id = event.pathParameters?.id;
    if (!id)
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "ID is required" }),
      };

    const customer = await CustomerService.deleteCustomer(id);

    if (!customer)
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Customer not found" }),
      };

    return { statusCode: 200, body: JSON.stringify(customer) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error }) };
  }
};
